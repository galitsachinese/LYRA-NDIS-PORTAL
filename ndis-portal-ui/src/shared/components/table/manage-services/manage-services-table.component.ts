import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-services-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-services-table.component.html',
})
export class ManageServicesTableComponent implements OnChanges {
  @Input() bookings: any[] = [];
  currentPage = 1;
  readonly pageSize = 5;

  get visibleServices(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.bookings.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.bookings.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get showingStart(): number {
    return this.bookings.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.bookings.length);
  }

  // Emits when toggle button is clicked
  @Output() toggleStatus = new EventEmitter<any>();
  // Emits when edit button is clicked
  @Output() editService = new EventEmitter<any>();
  // Emits when delete button is clicked
  @Output() deleteService = new EventEmitter<any>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bookings'] && this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
  }

  // Extract initials from service name
  getInitials(name: string): string {
    if (!name) return '??';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
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
}
