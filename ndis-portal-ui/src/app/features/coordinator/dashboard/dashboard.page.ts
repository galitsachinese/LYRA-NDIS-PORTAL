import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusCardComponent } from '../../../../shared/components/card/status-card/status-card.component';
import { BookingQueueTableComponent } from '../../../../shared/components/table/booking-queue/booking-queue-table.component';
import { ApiService } from '../../../core/services/api-service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatusCardComponent, BookingQueueTableComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardComponent implements OnInit {
  stats: any[] = [
    {
      label: 'TOTAL BOOKINGS',
      value: 0,
      icon: 'h-6 w-6 2xl:h-8 2xl:w-8 min-[3840px]:h-12 min-[3840px]:w-12',
      color: '#7C3AED',
      bg: '#FAF5FF',
    },
    {
      label: 'PENDING APPROVAL',
      value: 0,
      icon: 'h-6 w-6 2xl:h-8 2xl:w-8 min-[3840px]:h-12 min-[3840px]:w-12',
      color: '#F59E0B',
      bg: '#FFFBEB',
    },
    {
      label: 'APPROVED',
      value: 0,
      icon: 'h-6 w-6 2xl:h-8 2xl:w-8 min-[3840px]:h-12 min-[3840px]:w-12',
      color: '#10B981',
      bg: '#ECFDF5',
    },
    {
      label: 'CANCELLED',
      value: 0,
      icon: 'h-6 w-6 2xl:h-8 2xl:w-8 min-[3840px]:h-12 min-[3840px]:w-12',
      color: '#EF4444',
      bg: '#FEF2F2',
    },
  ];

  bookings: any[] = [];
  filteredBookings: any[] = [];
  pagedBookings: any[] = [];
  isLoading = true;
  isLoadingBookings = true;

  selectedFilter = 'All';
  currentPage = 1;
  readonly pageSize = 5;

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
    this.api.getBookings().subscribe({
      next: (res: any) => {
        const data = res.Data || res;
        this.bookings = Array.isArray(data) ? data : [];
        this.applyCurrentFilter(false);

        this.isLoadingBookings = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.isLoadingBookings = false;
      },
    });
  }

  approveBooking(booking: any): void {
    this.api.updateBookingStatus(booking.id, 'Approved').subscribe({
      next: () => {
        booking.status = 'Approved';
        this.applyCurrentFilter(false);
        this.loadStats();
        this.toast.show('Booking approved successfully!', 'success');
      },
      error: (err) => {
        console.error('Error approving booking:', err);
        this.toast.show(
          'Failed to approve booking. Please try again.',
          'error',
        );
      },
    });
  }

  cancelBooking(booking: any): void {
    this.api.updateBookingStatus(booking.id, 'Cancelled').subscribe({
      next: () => {
        booking.status = 'Cancelled';
        this.applyCurrentFilter(false);
        this.loadStats();
        this.toast.show('Booking cancelled successfully!', 'success');
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
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
}
