import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { TableComponent, TableColumn } from '../../ui/table/table.ui';

@Component({
  selector: 'app-booking-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <app-table
      [columns]="visibleColumns"
      [data]="bookings"
      (viewAction)="viewBooking.emit($event)"
      (cancelAction)="cancelBooking.emit($event)"
    >
    </app-table>
  `,
})
export class BookingTableComponent implements OnChanges {
  @Input() bookings: any[] = [];
  @Input() currentFilter: string = 'all'; // New input to track filter state
  @Output() viewBooking = new EventEmitter<any>();
  @Output() cancelBooking = new EventEmitter<any>();

  // Base columns always shown
  private baseColumns: TableColumn[] = [
    { key: 'service', label: 'Service' },
    { key: 'category', label: 'Category', type: 'category' },
    { key: 'date', label: 'Date' },
    { key: 'view', label: 'Note', type: 'view' },
    { key: 'status', label: 'Status', type: 'status' },
  ];

  visibleColumns: TableColumn[] = [...this.baseColumns];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentFilter']) {
      this.updateColumns();
    }
  }

  private updateColumns() {
    if (this.currentFilter.toLowerCase() === 'pending') {
      // Add Action column only if it's not already there
      this.visibleColumns = [
        ...this.baseColumns,
        { key: 'action', label: 'Action', type: 'action' },
      ];
    } else {
      // Revert to base columns (hides Action)
      this.visibleColumns = [...this.baseColumns];
    }
  }
}
