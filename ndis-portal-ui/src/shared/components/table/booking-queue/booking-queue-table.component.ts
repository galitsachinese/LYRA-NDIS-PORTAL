import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-booking-queue-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-queue-table.component.html',
})
export class BookingQueueTableComponent {
  @Input() bookings: any[] = [];
  @Input() pagedBookings: any[] = [];
  @Input() isLoading = false;
  @Input() activeFilterLabel = 'All';
  @Input() selectedFilter = 'All';
  @Input() statusOptions: Array<{ label: string; value: string }> = [];
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() pageNumbers: number[] = [];
  @Input() showingEnd = 0;

  @Output() refresh = new EventEmitter<void>();
  @Output() statusChange = new EventEmitter<string>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() approve = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<any>();

  activeMenuId: number | null = null;
  isFilterDropdownOpen = false;
  selectedNotesBooking: any | null = null;

  toggleMenu(booking: any): void {
    this.activeMenuId = this.activeMenuId === booking.id ? null : booking.id;
  }

  toggleFilterDropdown(): void {
    this.isFilterDropdownOpen = !this.isFilterDropdownOpen;
  }

  selectStatus(status: string): void {
    this.isFilterDropdownOpen = false;
    this.activeMenuId = null;
    this.statusChange.emit(status);
  }

  viewNotes(booking: any): void {
    this.selectedNotesBooking = booking;
    this.activeMenuId = null;
  }

  closeNotes(): void {
    this.selectedNotesBooking = null;
  }

  getInitials(booking: any): string {
    const name = booking.participantName || `User ${booking.userId}`;
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part.charAt(0).toUpperCase())
      .join('');
  }

  getAvatarClass(booking: any): string {
    const colors = [
      'bg-rose-100 text-rose-600',
      'bg-violet-100 text-violet-600',
      'bg-sky-100 text-sky-600',
      'bg-emerald-100 text-emerald-600',
      'bg-orange-100 text-orange-600',
    ];

    return colors[Math.abs(Number(booking.id) || 0) % colors.length];
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-700';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-700';
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  isPending(booking: any): boolean {
    return booking.status === 'Pending';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedMenu = target.closest('[data-testid="menu-btn"]');
    const clickedFilter = target.closest('[data-testid="status-filter"]');

    if (!clickedMenu) {
      this.activeMenuId = null;
    }
    if (!clickedFilter) {
      this.isFilterDropdownOpen = false;
    }
  }
}
