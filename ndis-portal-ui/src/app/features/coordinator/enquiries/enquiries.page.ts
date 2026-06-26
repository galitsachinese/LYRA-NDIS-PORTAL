import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactEnquiryService } from '../../../core/services/contact-enquiry.service';
import { ContactEnquiry } from '../../../core/models/contact-enquiry.model';

@Component({
  selector: 'app-enquiries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enquiries.page.html',
})
export class EnquiriesComponent implements OnInit {
  enquiries: ContactEnquiry[] = [];
  filteredEnquiries: ContactEnquiry[] = [];
  isLoading = true;
  selectedEnquiry: ContactEnquiry | null = null;
  isModalOpen = false;
  statusFilter: string = '';
  searchTerm: string = '';
  unreadCount = 0;

  readonly statusOptions = [
    { label: 'All', value: '' },
    { label: 'Unread', value: 'Unread' },
    { label: 'Read', value: 'Read' },
  ];

  constructor(private enquiryService: ContactEnquiryService) {}

  ngOnInit(): void {
    this.loadEnquiries();
  }

  loadEnquiries(): void {
    this.isLoading = true;
    this.enquiryService.getEnquiries().subscribe({
      next: (data) => {
        this.enquiries = data;
        this.unreadCount = data.filter((e) => !e.isRead).length;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.enquiries = [];
        this.filteredEnquiries = [];
        this.unreadCount = 0;
        this.isLoading = false;
      },
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let results = [...this.enquiries];

    // Status filter
    if (this.statusFilter === 'Unread') {
      results = results.filter((e) => !e.isRead);
    } else if (this.statusFilter === 'Read') {
      results = results.filter((e) => e.isRead);
    }

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      results = results.filter(
        (e) =>
          e.firstName.toLowerCase().includes(term) ||
          e.lastName.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term),
      );
    }

    this.filteredEnquiries = results;
  }

  viewEnquiry(enquiry: ContactEnquiry): void {
    this.selectedEnquiry = enquiry;
    this.isModalOpen = true;

    // If unread, mark as read via API
    if (!enquiry.isRead) {
      this.enquiryService.getEnquiryById(enquiry.id).subscribe({
        next: (updated) => {
          enquiry.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        },
        error: () => {
          // Silently fail - still show the modal
        },
      });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedEnquiry = null;
  }

  getFullName(enquiry: ContactEnquiry): string {
    return `${enquiry.firstName} ${enquiry.lastName}`;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}