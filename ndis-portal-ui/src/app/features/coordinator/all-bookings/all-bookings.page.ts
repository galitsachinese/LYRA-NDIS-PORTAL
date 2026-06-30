import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api-service';
import { ToastService } from '../../../core/services/toast.service';
import { BookingQueueTableComponent } from '../../../../shared/components/table/booking-queue/booking-queue-table.component';
import { DialogUi } from '../../../../shared/ui/dialog/dialog.ui';
import { SupportWorker, SupportWorkersService } from '../../../core/services/support-workers.service';

type BookingAction = 'approve' | 'cancel';

@Component({
  selector: 'app-all-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, BookingQueueTableComponent, DialogUi],
  templateUrl: './all-bookings.page.html',
})
export class AllBookingsComponent implements OnInit {
  allBookings: any[] = [];
  bookings: any[] = [];
  pagedBookings: any[] = [];
  isLoadingBookings = true;
  activeFilter = 'all';

  currentPage = 1;
  readonly pageSize = 5;
  pendingAction: BookingAction | null = null;
  selectedActionBooking: any | null = null;
  isUpdatingBooking = false;
  supportWorkers: SupportWorker[] = [];
  selectedAssignBooking: any | null = null;
  selectedWorkerId = '';
  workerToUnassignBooking: any | null = null;
  isAssigningWorker = false;

  isFilterDropdownOpen = false;

  readonly statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Approved', value: 'approved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private supportWorkersService: SupportWorkersService,
  ) {}

  ngOnInit(): void {
    this.loadBookings();
    this.loadSupportWorkers();
  }

  loadBookings(showToast = false): void {
    this.isLoadingBookings = true;

    this.api.getBookings().subscribe({
      next: (res: any) => {
        const data = res.Data || res;
        this.allBookings = Array.isArray(data) ? data : [];
        this.applyStatusFilter();
        this.isLoadingBookings = false;

        if (showToast) {
          this.toast.show('Bookings refreshed successfully!', 'success');
        }
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.allBookings = [];
        this.bookings = [];
        this.pagedBookings = [];
        this.isLoadingBookings = false;
      },
    });
  }

  refreshBookings(): void {
    this.loadBookings(true);
    this.loadSupportWorkers();
  }

  loadSupportWorkers(): void {
    this.supportWorkersService.getSupportWorkers().subscribe({
      next: (workers) => {
        this.supportWorkers = workers;
      },
      error: (error) => {
        console.error('Error loading support workers:', error);
        this.supportWorkers = [];
      },
    });
  }

  openAssignWorker(booking: any): void {
    this.selectedAssignBooking = booking;
    this.selectedWorkerId = '';
  }

  closeAssignWorker(): void {
    if (this.isAssigningWorker) {
      return;
    }

    this.selectedAssignBooking = null;
    this.selectedWorkerId = '';
  }

  confirmAssignWorker(): void {
    if (!this.selectedAssignBooking || !this.selectedWorkerId) {
      return;
    }

    const workerId = Number(this.selectedWorkerId);
    const worker = this.supportWorkers.find((item) => item.id === workerId);

    this.isAssigningWorker = true;
    this.api
      .assignWorkerToBooking(this.selectedAssignBooking.id, workerId)
      .subscribe({
        next: (response) => {
          this.applyAssignedWorker(
            this.selectedAssignBooking,
            worker,
            response,
          );
          this.isAssigningWorker = false;
          this.closeAssignWorker();
          this.toast.show(
            'Worker assigned successfully. Participant will be notified.',
            'success',
          );
        },
        error: (error) => {
          console.error('Error assigning worker:', error);
          this.isAssigningWorker = false;
          this.toast.show(
            error?.message || 'Failed to assign worker. Please try again.',
            'error',
          );
        },
      });
  }

  requestUnassignWorker(booking: any): void {
    this.workerToUnassignBooking = booking;
  }

  closeUnassignWorker(): void {
    if (this.isAssigningWorker) {
      return;
    }

    this.workerToUnassignBooking = null;
  }

  confirmUnassignWorker(): void {
    if (!this.workerToUnassignBooking) {
      return;
    }

    const booking = this.workerToUnassignBooking;
    this.isAssigningWorker = true;
    this.api.unassignWorkerFromBooking(booking.id).subscribe({
      next: () => {
        this.clearAssignedWorker(booking);
        this.workerToUnassignBooking = null;
        this.isAssigningWorker = false;
        this.toast.show('Assigned worker removed successfully.', 'success');
      },
      error: (error) => {
        console.error('Error removing assigned worker:', error);
        this.isAssigningWorker = false;
        this.toast.show(
          error?.message ||
            'Failed to remove assigned worker. Please try again.',
          'error',
        );
      },
    });
  }

  get eligibleWorkers(): SupportWorker[] {
    if (!this.selectedAssignBooking) {
      return [];
    }

    const bookingServiceId = this.getBookingServiceId(
      this.selectedAssignBooking,
    );
    const bookingServiceName = (
      this.selectedAssignBooking.serviceName || ''
    ).toLowerCase();

    return this.supportWorkers.filter((worker) => {
      const isActive = (worker.status || 'Active').toLowerCase() === 'active';
      const sameServiceById =
        bookingServiceId > 0 && worker.assignedServiceId === bookingServiceId;
      const sameServiceByName =
        !sameServiceById &&
        Boolean(worker.assignedServiceName) &&
        worker.assignedServiceName!.toLowerCase() === bookingServiceName;

      return isActive && (sameServiceById || sameServiceByName);
    });
  }

  get selectedAssignBookingLabel(): string {
    if (!this.selectedAssignBooking) {
      return '';
    }

    return `${this.getBookingParticipantName(this.selectedAssignBooking)} - ${this.selectedAssignBooking.serviceName || 'Service'}`;
  }

  get workerToUnassignName(): string {
    return this.getAssignedWorkerName(this.workerToUnassignBooking);
  }

  requestApproveBooking(booking: any): void {
    this.openActionConfirmation('approve', booking);
  }

  requestCancelBooking(booking: any): void {
    this.openActionConfirmation('cancel', booking);
  }

  closeActionConfirmation(): void {
    if (this.isUpdatingBooking) {
      return;
    }

    this.pendingAction = null;
    this.selectedActionBooking = null;
  }

  confirmBookingAction(): void {
    if (!this.pendingAction || !this.selectedActionBooking) {
      return;
    }

    if (this.pendingAction === 'approve') {
      this.approveBooking(this.selectedActionBooking);
      return;
    }

    this.cancelBooking(this.selectedActionBooking);
  }

  get confirmationTitle(): string {
    return this.pendingAction === 'approve'
      ? 'Approve this booking?'
      : 'Cancel this booking?';
  }

  get confirmationMessage(): string {
    const name = this.getBookingParticipantName(this.selectedActionBooking);
    const service = this.selectedActionBooking?.serviceName || 'this service';

    return this.pendingAction === 'approve'
      ? `This will approve ${name}'s booking for ${service}.`
      : `This will cancel ${name}'s booking for ${service}.`;
  }

  get confirmationButtonText(): string {
    if (this.isUpdatingBooking) {
      return this.pendingAction === 'approve'
        ? 'Approving...'
        : 'Cancelling...';
    }

    return this.pendingAction === 'approve'
      ? 'Approve Booking'
      : 'Cancel Booking';
  }

  private approveBooking(booking: any): void {
    this.isUpdatingBooking = true;

    this.api.updateBookingStatus(booking.id, 'Approved').subscribe({
      next: () => {
        booking.status = 'Approved';
        this.applyStatusFilter();
        this.resetActionConfirmation();
        this.toast.show('Booking approved successfully!', 'success');
      },
      error: (err) => {
        console.error('Error approving booking:', err);
        this.isUpdatingBooking = false;
        this.toast.show(
          'Failed to approve booking. Please try again.',
          'error',
        );
      },
    });
  }

  private cancelBooking(booking: any): void {
    this.isUpdatingBooking = true;

    this.api.updateBookingStatus(booking.id, 'Cancelled').subscribe({
      next: () => {
        booking.status = 'Cancelled';
        this.applyStatusFilter();
        this.resetActionConfirmation();
        this.toast.show('Booking cancelled successfully!', 'success');
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
        this.isUpdatingBooking = false;
        this.toast.show('Failed to cancel booking. Please try again.', 'error');
      },
    });
  }

  handleStatusFilter(status: string): void {
    this.activeFilter = status;
    this.currentPage = 1;
    this.applyStatusFilter();
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.updatePagedBookings();
  }

  get activeFilterLabel(): string {
    return (
      this.statusOptions.find((option) => option.value === this.activeFilter)
        ?.label || 'All'
    );
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.bookings.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get showingStart(): number {
    return this.bookings.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.bookings.length);
  }

  private applyStatusFilter(): void {
    if (this.activeFilter === 'all') {
      this.bookings = [...this.allBookings];
    } else {
      this.bookings = this.allBookings.filter(
        (booking) => booking.status?.toLowerCase() === this.activeFilter,
      );
    }

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.updatePagedBookings();
  }

  private updatePagedBookings(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedBookings = this.bookings.slice(
      startIndex,
      startIndex + this.pageSize,
    );
  }

  private openActionConfirmation(action: BookingAction, booking: any): void {
    this.pendingAction = action;
    this.selectedActionBooking = booking;
  }

  private resetActionConfirmation(): void {
    this.pendingAction = null;
    this.selectedActionBooking = null;
    this.isUpdatingBooking = false;
  }

  private getBookingParticipantName(booking: any): string {
    const name =
      booking?.participantName ||
      booking?.name ||
      `User ${booking?.userId || ''}`;

    return String(name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  }

  private getBookingServiceId(booking: any): number {
    return Number(
      booking?.serviceId ??
        booking?.ServiceId ??
        booking?.service?.id ??
        booking?.Service?.Id ??
        0,
    );
  }

  private getAssignedWorkerName(booking: any): string {
    const name =
      booking?.assignedWorkerName ??
      booking?.AssignedWorkerName ??
      booking?.supportWorkerName ??
      booking?.SupportWorkerName ??
      booking?.workerName ??
      booking?.WorkerName ??
      '';

    return String(name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  }

  private applyAssignedWorker(
    booking: any,
    worker?: SupportWorker,
    response?: any,
  ): void {
    if (!worker && !response) {
      return;
    }

    const workerId = response?.workerId ?? response?.WorkerId ?? worker?.id;
    const workerName =
      response?.workerName ?? response?.WorkerName ?? worker?.fullName;

    booking.assignedWorkerId = workerId;
    booking.AssignedWorkerId = workerId;
    booking.supportWorkerId = workerId;
    booking.SupportWorkerId = workerId;
    booking.assignedWorkerName = workerName;
    booking.AssignedWorkerName = workerName;
    booking.supportWorkerName = workerName;
    booking.SupportWorkerName = workerName;
    booking.workerName = workerName;
    booking.WorkerName = workerName;
  }

  private clearAssignedWorker(booking: any): void {
    booking.assignedWorkerId = null;
    booking.AssignedWorkerId = null;
    booking.supportWorkerId = null;
    booking.SupportWorkerId = null;
    booking.assignedWorkerName = null;
    booking.AssignedWorkerName = null;
    booking.supportWorkerName = null;
    booking.SupportWorkerName = null;
    booking.workerName = null;
    booking.WorkerName = null;
  }

  toggleFilterDropdown(): void {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  selectStatus(status: string): void {
    this.isFilterDropdownOpen = false;
    this.handleStatusFilter(status);
  }
}
