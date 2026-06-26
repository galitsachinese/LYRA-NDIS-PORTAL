import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';
import { ApiService } from '../../../core/services/api-service';
import { SupportWorker, SupportWorkerPayload, SupportWorkerStatus, SupportWorkersService } from '../../../core/services/support-workers.service';
import { ToastService } from '../../../core/services/toast.service';
import { DialogUi } from '../../../../shared/ui/dialog/dialog.ui';

interface ServiceOption {
  id: number;
  name: string;
  category: string;
}

interface WorkerForm {
  fullName: string;
  email: string;
  phone: string;
  assignedServiceId: string;
}

@Component({
  selector: 'app-support-workers',
  standalone: true,
  imports: [CommonModule, FormsModule, AddButtonComponent, DialogUi],
  templateUrl: './support-workers.page.html',
})
export class SupportWorkersComponent implements OnInit {
  workers: SupportWorker[] = [];
  services: ServiceOption[] = [];

  statusFilter = 'all';
  serviceFilter = 'all';
  searchTerm = '';

  isLoading = true;
  isSaving = false;
  error: string | null = null;

  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  showStatusConfirm = false;
  showInactiveBookingWarning = false;
  isEditMode = false;
  isUpdatingStatus = false;
  isLoadingUpcomingBookings = false;

  selectedWorker: SupportWorker | null = null;
  workerToDelete: SupportWorker | null = null;
  workerToChangeStatus: SupportWorker | null = null;
  editingWorkerId: number | null = null;
  selectedStatus: SupportWorkerStatus = 'Active';
  upcomingAssignedBookingCount = 0;
  bookings: any[] = [];

  // Profile picture upload state
  isUploadingPicture = false;
  uploadPictureError: string | null = null;
  selectedPreviewFile: File | null = null;
  selectedPreviewUrl: string | null = null;

  formErrors: Record<string, string> = {};

  workerForm: WorkerForm = {
    fullName: '',
    email: '',
    phone: '',
    assignedServiceId: '',
  };

  private readonly toast = inject(ToastService);

  constructor(
    private readonly api: ApiService,
    private readonly supportWorkersService: SupportWorkersService
  ) {}

  ngOnInit(): void {
    this.loadServices();
    this.loadWorkers();
    this.loadBookings();
  }

  get filteredWorkers(): SupportWorker[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.workers.filter((worker) => {
      const status = this.getWorkerStatus(worker).toLowerCase();
      const serviceId = String(worker.assignedServiceId || '');
      const searchable = `${worker.fullName || ''} ${worker.email || ''}`.toLowerCase();

      return (
        (this.statusFilter === 'all' || status === this.statusFilter) &&
        (this.serviceFilter === 'all' || serviceId === this.serviceFilter) &&
        (!query || searchable.includes(query))
      );
    });
  }

  loadWorkers(): void {
    this.isLoading = true;
    this.error = null;

    this.supportWorkersService.getSupportWorkers().subscribe({
      next: (workers) => {
        this.workers = workers;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error?.message || 'Failed to load support workers.';
        this.isLoading = false;
      },
    });
  }

  loadServices(): void {
    this.api.getServices().subscribe({
      next: (response) => {
        const items = Array.isArray(response?.Data)
          ? response.Data
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : [];

        this.services = items
          .map((service: any) => ({
            id: Number(service?.id ?? service?.Id ?? 0),
            name: service?.name ?? service?.Name ?? service?.title ?? service?.Title ?? 'Untitled Service',
            category:
              service?.category ??
              service?.Category ??
              service?.categoryName ??
              service?.CategoryName ??
              service?.serviceCategory ??
              service?.ServiceCategory ??
              'Uncategorized',
          }))
          .filter((service: ServiceOption) => service.id > 0);
      },
      error: () => {
        this.services = [];
      },
    });
  }

  loadBookings(): void {
    this.api.getBookings().subscribe({
      next: (response) => {
        this.bookings = this.unwrapBookings(response);
      },
      error: () => {
        this.bookings = [];
      },
    });
  }

  openModal(): void {
    this.isEditMode = false;
    this.editingWorkerId = null;
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    if (this.isSaving) {
      return;
    }

    this.showModal = false;
    this.isEditMode = false;
    this.editingWorkerId = null;
    this.resetForm();
  }

  viewWorker(worker: SupportWorker): void {
    this.selectedWorker = worker;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedWorker = null;
  }

  editWorker(worker: SupportWorker): void {
    this.isEditMode = true;
    this.editingWorkerId = worker.id;
    this.workerForm = {
      fullName: worker.fullName,
      email: worker.email,
      phone: worker.phone || '',
      assignedServiceId: String(worker.assignedServiceId || ''),
    };
    this.formErrors = {};
    this.showModal = true;
  }

  confirmDelete(worker: SupportWorker): void {
    this.workerToDelete = worker;
    this.showDeleteConfirm = true;
  }

  openStatusConfirmation(worker: SupportWorker): void {
    this.workerToChangeStatus = worker;
    this.selectedStatus =
      this.getWorkerStatus(worker).toLowerCase() === 'inactive'
        ? 'Active'
        : 'Inactive';
    this.upcomingAssignedBookingCount = 0;
    this.showStatusConfirm = true;

    if (this.selectedStatus === 'Inactive') {
      this.loadUpcomingBookingCount(worker.id);
    }
  }

  closeStatusConfirmation(): void {
    if (this.isUpdatingStatus) {
      return;
    }

    this.showStatusConfirm = false;
    this.workerToChangeStatus = null;
    this.selectedStatus = 'Active';
    this.upcomingAssignedBookingCount = 0;
    this.showInactiveBookingWarning = false;
  }

  confirmStatusChange(): void {
    if (!this.workerToChangeStatus) {
      return;
    }

    if (this.selectedStatus === 'Inactive' && this.upcomingAssignedBookingCount > 0) {
      this.showStatusConfirm = false;
      this.showInactiveBookingWarning = true;
      return;
    }

    this.applyStatusChange();
  }

  onSelectedStatusChange(status: SupportWorkerStatus): void {
    this.selectedStatus = status;

    if (!this.workerToChangeStatus) {
      return;
    }

    if (status === 'Inactive') {
      this.loadUpcomingBookingCount(this.workerToChangeStatus.id);
      return;
    }

    this.upcomingAssignedBookingCount = 0;
    this.isLoadingUpcomingBookings = false;
  }

  cancelInactiveBookingWarning(): void {
    if (this.isUpdatingStatus) {
      return;
    }

    this.showInactiveBookingWarning = false;
    this.showStatusConfirm = true;
  }

  confirmInactiveBookingWarning(): void {
    if (!this.workerToChangeStatus) {
      return;
    }

    this.applyStatusChange();
  }

  private applyStatusChange(): void {
    if (!this.workerToChangeStatus) {
      return;
    }

    const worker = this.workerToChangeStatus;
    this.isUpdatingStatus = true;

    this.supportWorkersService.updateSupportWorkerStatus(worker.id, this.selectedStatus).subscribe({
      next: (updatedWorker) => {
        this.workers = this.workers.map((item) =>
          item.id === worker.id ? { ...item, status: updatedWorker.status || this.selectedStatus } : item
        );
        this.isUpdatingStatus = false;
        this.showInactiveBookingWarning = false;
        this.closeStatusConfirmation();
        this.toast.show('Support worker status updated successfully.', 'success');
      },
      error: (error) => {
        this.isUpdatingStatus = false;
        this.toast.show(error?.message || 'Could not update support worker status.', 'error');
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.workerToDelete = null;
  }

  deleteWorker(): void {
    if (!this.workerToDelete) {
      return;
    }

    const workerId = this.workerToDelete.id;

    this.supportWorkersService.deleteSupportWorker(workerId).subscribe({
      next: () => {
        this.workers = this.workers.filter((worker) => worker.id !== workerId);
        this.toast.show('Support worker deleted successfully.', 'success');
        this.cancelDelete();
      },
      error: (error) => {
        this.toast.show(error?.message || 'Could not delete support worker.', 'error');
      },
    });
  }

  saveWorker(): void {
    if (!this.validateForm()) {
      return;
    }

    const payload: SupportWorkerPayload = {
      fullName: this.workerForm.fullName.trim(),
      email: this.workerForm.email.trim(),
      phone: this.workerForm.phone.trim(),
      assignedServiceId: Number(this.workerForm.assignedServiceId),
    };

    this.isSaving = true;
    const request =
      this.isEditMode && this.editingWorkerId
        ? this.supportWorkersService.updateSupportWorker(this.editingWorkerId, payload)
        : this.supportWorkersService.createSupportWorker(payload);

    request.subscribe({
      next: () => {
        this.toast.show(
          this.isEditMode ? 'Support worker updated successfully.' : 'Support worker added successfully.',
          'success'
        );
        this.isSaving = false;
        this.showModal = false;
        this.isEditMode = false;
        this.editingWorkerId = null;
        this.resetForm();
        this.loadWorkers();
      },
      error: (error) => {
        this.isSaving = false;
        this.toast.show(error?.message || 'Could not save support worker.', 'error');
      },
    });
  }

  getServiceName(worker: SupportWorker | null): string {
    if (!worker) {
      return 'Unassigned';
    }

    return (
      worker.assignedServiceName ||
      this.services.find((service) => service.id === worker.assignedServiceId)?.name ||
      'Unassigned'
    );
  }

  getServiceCategory(worker: SupportWorker | null): string {
    if (!worker) {
      return 'Uncategorized';
    }

    return (
      this.services.find((service) => service.id === worker.assignedServiceId)?.category ||
      'Uncategorized'
    );
  }

  getWorkerStatus(worker: SupportWorker): string {
    return worker.status?.trim() || 'Active';
  }

  getWorkerStatusClass(worker: SupportWorker): string {
    switch (this.getWorkerStatus(worker).toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'inactive':
        return 'bg-red-50 text-red-600';
      case 'on leave':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  getLocalUpcomingAssignedBookingCount(): number {
    if (!this.workerToChangeStatus || this.selectedStatus !== 'Inactive') {
      return 0;
    }

    const workerId = this.workerToChangeStatus.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.bookings.filter((booking) => {
      const assignedWorkerId = Number(
        booking?.assignedWorkerId ??
          booking?.AssignedWorkerId ??
          booking?.supportWorkerId ??
          booking?.SupportWorkerId ??
          0
      );
      const preferredDate = new Date(
        booking?.preferredDate ??
          booking?.PreferredDate ??
          booking?.bookingDate ??
          booking?.BookingDate ??
          ''
      );

      return (
        assignedWorkerId === workerId &&
        !Number.isNaN(preferredDate.getTime()) &&
        preferredDate >= today &&
        String(booking?.status ?? booking?.Status ?? '').toLowerCase() !== 'cancelled'
      );
    }).length;
  }

  private loadUpcomingBookingCount(workerId: number): void {
    this.isLoadingUpcomingBookings = true;

    this.supportWorkersService.getUpcomingBookingCount(workerId).subscribe({
      next: (count) => {
        this.upcomingAssignedBookingCount = count;
        this.isLoadingUpcomingBookings = false;
      },
      error: () => {
        this.upcomingAssignedBookingCount = this.getLocalUpcomingAssignedBookingCount();
        this.isLoadingUpcomingBookings = false;
      },
    });
  }

  get statusChangeButtonText(): string {
    return this.isUpdatingStatus ? 'Updating...' : 'Confirm Status';
  }

  get upcomingBookingsLabel(): string {
    return this.upcomingAssignedBookingCount === 1
      ? '1 upcoming booking'
      : `${this.upcomingAssignedBookingCount} upcoming bookings`;
  }

  get hasActiveFilters(): boolean {
    return (
      this.statusFilter !== 'all' ||
      this.serviceFilter !== 'all' ||
      this.searchTerm.trim().length > 0
    );
  }

  clearFilters(): void {
    this.statusFilter = 'all';
    this.serviceFilter = 'all';
    this.searchTerm = '';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  formatName(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  }

  /* ==========================================================
     PROFILE PICTURE UPLOAD
     ========================================================== */

  onFileSelected(event: Event): void {
    this.uploadPictureError = null;
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedPreviewFile = null;
      this.selectedPreviewUrl = null;
      return;
    }

    const file = input.files[0];

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadPictureError = 'Invalid file type. Only JPG and PNG files are allowed.';
      input.value = '';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.uploadPictureError = 'File size must not exceed 5MB.';
      input.value = '';
      return;
    }

    this.selectedPreviewFile = file;

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedPreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadPicture(): void {
    if (!this.selectedPreviewFile || !this.editingWorkerId) {
      return;
    }

    this.isUploadingPicture = true;
    this.uploadPictureError = null;

    this.supportWorkersService.uploadProfilePicture(this.editingWorkerId, this.selectedPreviewFile).subscribe({
      next: (result) => {
        // Update the worker in the list
        this.workers = this.workers.map((w) =>
          w.id === this.editingWorkerId
            ? { ...w, profilePicture: result.profilePicture }
            : w
        );
        this.isUploadingPicture = false;
        this.selectedPreviewFile = null;
        this.selectedPreviewUrl = null;
        this.toast.show('Profile picture uploaded successfully.', 'success');
      },
      error: (error) => {
        this.isUploadingPicture = false;
        this.uploadPictureError = error?.message || 'Failed to upload profile picture.';
      },
    });
  }

  clearSelectedPreview(): void {
    this.selectedPreviewFile = null;
    this.selectedPreviewUrl = null;
    this.uploadPictureError = null;
  }

  private resetForm(): void {
    this.workerForm = {
      fullName: '',
      email: '',
      phone: '',
      assignedServiceId: '',
    };
    this.formErrors = {};
    this.selectedPreviewFile = null;
    this.selectedPreviewUrl = null;
    this.uploadPictureError = null;
  }

  private unwrapBookings(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.Data)) {
      return response.Data;
    }

    return [];
  }

  private validateForm(): boolean {
    this.formErrors = {};

    if (!this.workerForm.fullName.trim()) {
      this.formErrors['fullName'] = 'Full name is required.';
    } else if (this.workerForm.fullName.trim().split(/\s+/).length < 2) {
      this.formErrors['fullName'] = 'Please provide both first and last name.';
    }

    if (!this.workerForm.email.trim()) {
      this.formErrors['email'] = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.workerForm.email.trim())) {
      this.formErrors['email'] = 'Please enter a valid email address.';
    }

    if (
      this.workerForm.phone.trim() &&
      !/^[\d\s+()-.]+$/.test(this.workerForm.phone.trim())
    ) {
      this.formErrors['phone'] = 'Phone number can only use numbers, spaces, +, -, and parentheses.';
    }

    if (!this.workerForm.assignedServiceId) {
      this.formErrors['assignedServiceId'] = 'Assigned service is required.';
    }

    return Object.keys(this.formErrors).length === 0;
  }

}
