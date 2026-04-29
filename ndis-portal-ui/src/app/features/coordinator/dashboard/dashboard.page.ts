import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StatusCardComponent } from '../../../../shared/components/card/status-card/status-card.component';
import { RecentBookingTable } from '../../../../shared/components/table/recent-bookings/recent-booking-table.component';
import { StatusDropdownComponent } from '../../../../shared/components/dropdown/status/status-dropdown.component';

import { BookingService } from '../../../../app/core/services/booking.service';
import { Booking } from '../../../../app/core/models/booking.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatusCardComponent,
    RecentBookingTable,
    StatusDropdownComponent, // IMPORTANT
  ],
  templateUrl: './dashboard.page.html',
})
export class DashboardComponent implements OnInit {
  // =========================
  // STATS (unchanged)
  // =========================
  stats: any[] = [
    {
      label: 'Total Bookings',
      value: 1250,
      icon: 'fa-solid fa-calendar-days',
      color: '#6366f1',
      bg: '#e0e7ff',
    },
    {
      label: 'Pending',
      value: 45,
      icon: 'fa-solid fa-clock',
      color: '#f59e0b',
      bg: '#fef3c7',
    },
    {
      label: 'Approved',
      value: 1180,
      icon: 'fa-solid fa-circle-check',
      color: '#10b981',
      bg: '#d1fae5',
    },
    {
      label: 'Cancelled',
      value: 25,
      icon: 'fa-solid fa-circle-xmark',
      color: '#ef4444',
      bg: '#fee2e2',
    },
  ];

  // =========================
  // FILTER STATE
  // =========================
  activeFilter: string = 'all';

  // =========================
  // BOOKINGS DATA
  // =========================
  recentBookings: Booking[] = [];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadRecentBookings();
  }

  // ==========================================
  // LOAD + FILTER BOOKINGS (MAIN FIX HERE)
  // ==========================================
  private loadRecentBookings(): void {
    this.bookingService.getBookings(this.activeFilter).subscribe({
      next: (bookings) => {
        this.recentBookings = bookings
          .sort(
            (a, b) =>
              new Date(b.preferredDate).getTime() -
              new Date(a.preferredDate).getTime(),
          )
          .slice(0, 5);
      },
      error: (err) => {
        console.error('Failed to load bookings:', err.message);
      },
    });
  }

  // ==========================================
  // DROPDOWN HANDLER (IMPORTANT FIX)
  // ==========================================
  handleStatusFilter(status: string): void {
    this.activeFilter = status;
    this.loadRecentBookings(); // 🔥 re-fetch based on filter
  }

  // ==========================================
  // TABLE ACTIONS
  // ==========================================
  onViewBooking(event: any) {
    console.log('View booking:', event);
  }

  onCancelBooking(event: any) {
    console.log('Cancel booking:', event);
  }

  onApproveBooking(event: any) {
    console.log('Approve booking:', event);
  }
}
