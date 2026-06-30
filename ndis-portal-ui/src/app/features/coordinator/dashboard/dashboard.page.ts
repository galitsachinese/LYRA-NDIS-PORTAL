import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusCardComponent } from '../../../../shared/components/card/status-card/status-card.component';
import { BookingQueueTableComponent } from '../../../../shared/components/table/booking-queue/booking-queue-table.component';
import { ApiService } from '../../../core/services/api-service';
import { ToastService } from '../../../core/services/toast.service';
import { DialogUi } from '../../../../shared/ui/dialog/dialog.ui';

type BookingAction = 'approve' | 'cancel';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatusCardComponent,
    BookingQueueTableComponent,
    DialogUi,
  ],
  templateUrl: './dashboard.page.html',
})
export class DashboardComponent implements OnInit {
  // Status cards configuration with valid SVG paths
  stats = [
    {
      label: 'TOTAL BOOKINGS',
      value: 0,
      accentColor: '#6B3293',
      valueColor: '#111827',
      iconBackground: '#F3E8FF',
      iconColor: '#6B3293',
      // Calendar icon SVG path
      iconPath:
        'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z',
    },
    {
      label: 'PENDING APPROVAL',
      value: 0,
      accentColor: '#F59E0B',
      valueColor: '#D97706',
      iconBackground: '#FEF3C7',
      iconColor: '#D97706',
      // Clock icon SVG path
      iconPath:
        'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z',
    },
    {
      label: 'APPROVED',
      value: 0,
      accentColor: '#10B981',
      valueColor: '#10B981',
      iconBackground: '#D1FAE5',
      iconColor: '#059669',
      // Check/checkmark icon SVG path
      iconPath: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z',
    },
    {
      label: 'CANCELLED',
      value: 0,
      accentColor: '#EF4444',
      valueColor: '#DC2626',
      iconBackground: '#FEE2E2',
      iconColor: '#DC2626',
      // X/close icon SVG path
      iconPath:
        'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z',
    },
  ];

  //

  bookings: any[] = [];
  filteredBookings: any[] = [];
  pagedBookings: any[] = [];
  isLoading = true;
  isLoadingBookings = true;
  bookingLoadError = '';

  selectedFilter = 'All';
  currentPage = 1;
  readonly pageSize = 5;
  pendingAction: BookingAction | null = null;
  selectedActionBooking: any | null = null;
  isUpdatingBooking = false;

  readonly statusOptions = [
    { label: 'All', value: 'All' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  constructor(
    private api: ApiService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadBookings();
  }

  loadStats(): void {
    this.api.getBookingStats().subscribe({
      next: (res: any) => {
        const data = res.Data || res;
        if (data) {
          this.stats[0].value = data.totalBookings || 0;
          this.stats[1].value = data.pending || 0;
          this.stats[2].value = data.approved || 0;
          this.stats[3].value = data.cancelled || 0;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading booking stats:', err);
        this.isLoading = false;
      },
    });
  }

  loadBookings(): void {
    this.isLoadingBookings = true;
    this.bookingLoadError = '';
    this.api.getBookings().subscribe({
      next: (res: any) => {
        const data = res.Data || res;
        this.bookings = Array.isArray(data) ? data : [];
        this.applyCurrentFilter(false);

        this.isLoadingBookings = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.bookings = [];
        this.filteredBookings = [];
        this.pagedBookings = [];
        this.bookingLoadError =
          err?.message || 'Unable to load bookings. Please try again.';
        this.toast.show(this.bookingLoadError, 'error');
        this.isLoadingBookings = false;
      },
    });
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
        this.applyCurrentFilter(false);
        this.loadStats();
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
        this.applyCurrentFilter(false);
        this.loadStats();
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

  refreshBookings(): void {
    this.loadBookings();
    this.loadStats();
    this.toast.show('Bookings refreshed successfully!', 'success');
  }

  filterByStatus(status: string, showToast: boolean = true): void {
    this.selectedFilter = status;
    this.currentPage = 1;
    this.applyCurrentFilter(showToast);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.updatePagedBookings();
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredBookings.length / this.pageSize));
  }

  get activeFilterLabel(): string {
    return this.selectedFilter;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get showingStart(): number {
    return this.filteredBookings.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredBookings.length,
    );
  }

  private applyCurrentFilter(showToast: boolean): void {
    if (this.selectedFilter === 'All') {
      this.filteredBookings = [...this.bookings];
    } else {
      this.filteredBookings = this.bookings.filter(
        (booking) =>
          booking.status?.toLowerCase() === this.selectedFilter.toLowerCase(),
      );
    }

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.updatePagedBookings();

    if (showToast) {
      this.toast.show(`Filtered by: ${this.selectedFilter}`, 'info');
    }
  }

  private updatePagedBookings(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.pagedBookings = this.filteredBookings.slice(
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

  isFilterDropdownOpen = false;

  toggleFilterDropdown(): void {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  selectStatus(status: string): void {
    this.isFilterDropdownOpen = false;
    this.filterByStatus(status, false);
  }
}
