import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api-service';
import { ToastService } from '../../../core/services/toast.service';
import { BookingQueueTableComponent } from '../../../../shared/components/table/booking-queue/booking-queue-table.component';

@Component({
  selector: 'app-all-bookings',
  standalone: true,
  imports: [CommonModule, BookingQueueTableComponent],
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

  readonly statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Approved', value: 'approved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  constructor(
    private api: ApiService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadBookings();
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
  }

  approveBooking(booking: any): void {
    this.api.updateBookingStatus(booking.id, 'Approved').subscribe({
      next: () => {
        booking.status = 'Approved';
        this.applyStatusFilter();
        this.toast.show('Booking approved successfully!', 'success');
      },
      error: (err) => {
        console.error('Error approving booking:', err);
        this.toast.show('Failed to approve booking. Please try again.', 'error');
      },
    });
  }

  cancelBooking(booking: any): void {
    this.api.updateBookingStatus(booking.id, 'Cancelled').subscribe({
      next: () => {
        booking.status = 'Cancelled';
        this.applyStatusFilter();
        this.toast.show('Booking cancelled successfully!', 'success');
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
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
}
