import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-services-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-services-table.component.html',
})
export class ManageServicesTableComponent {
  @Input() bookings: any[] = [];

  // Emits when toggle button is clicked
  @Output() toggleStatus = new EventEmitter<any>();

  // Extract initials from service name
  getInitials(name: string): string {
    if (!name) return '??';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
  }
}
