import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddButtonComponent } from '../../../../shared/components/button/add-button/add-button.component';
import { ApiService } from '../../../core/services/api-service';
import { SupportWorker, SupportWorkerPayload, SupportWorkersService } from '../../../core/services/support-workers.service';
import { ToastService } from '../../../core/services/toast.service';

interface ServiceOption {
  id: number;
  name: string;
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
  imports: [CommonModule, FormsModule, AddButtonComponent],
  templateUrl: './support-workers.page.html',
})
export class SupportWorkersComponent implements OnInit {
  workers: SupportWorker[] = [];
  services: ServiceOption[] = [];

  isLoading = true;
  isSaving = false;
  error: string | null = null;

  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  isEditMode = false;

  selectedWorker: SupportWorker | null = null;
  workerToDelete: SupportWorker | null = null;
  editingWorkerId: number | null = null;

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
          }))
          .filter((service: ServiceOption) => service.id > 0);
      },
      error: () => {
        this.services = [];
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

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  private resetForm(): void {
    this.workerForm = {
      fullName: '',
      email: '',
      phone: '',
      assignedServiceId: '',
    };
    this.formErrors = {};
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
