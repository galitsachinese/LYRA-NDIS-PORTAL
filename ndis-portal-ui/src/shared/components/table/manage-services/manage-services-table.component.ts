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

  @Output() toggleStatus = new EventEmitter<any>();

  isActive(service: any): boolean {
    return service?.status === 'Active';
  }
}
