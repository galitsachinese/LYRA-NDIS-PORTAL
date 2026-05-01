import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../../shared/ui/table/table.ui';
import { TableColumn } from '../../../../shared/models/table.model';

@Component({
  selector: 'app-manage-services-table',
  standalone: true,
  imports: [CommonModule, TableComponent],
  template: `
    <app-table-ui
      [columns]="serviceColumns"
      [data]="bookings"
      (toggleAction)="onToggleStatus.emit($event)"
    ></app-table-ui>
  `,
})
export class ManageServicesTableComponent {
  @Input() bookings: any[] = [];

  // Emits when toggle button is clicked
  @Output() toggleStatus = new EventEmitter<any>();

  // Alias for template binding
  onToggleStatus = this.toggleStatus;

  serviceColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'name' },
    { key: 'category', label: 'Category', type: 'category' },
    { key: 'status', label: 'Status', type: 'status' },
    {
      key: 'actions',
      label: 'Actions',
      type: 'toggle',
    },
  ];
}
