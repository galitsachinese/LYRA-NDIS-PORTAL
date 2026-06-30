import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

import { TableComponent } from '../../../ui/table/table.ui';
import { TableColumn, TableAction } from '../../../models/table.model';

/**
 * BookingQueueTableComponent
 *
 * Admin-facing wrapper around <app-table-ui>.
 * Handles the booking queue with Approve/Cancel inline actions
 * and optional worker assignment column.
 *
 * COLUMN VISIBILITY:
 * - Worker column only shown when [showWorkerAssignment]="true"
 * - Actions column shows Approve + Cancel for pending bookings
 *
 * OUTPUTS:
 * - approve        → emitted when Approve is clicked
 * - cancel         → emitted when Cancel is clicked
 * - assignWorker   → emitted when Assign Worker is clicked
 * - unassignWorker → emitted when worker is removed
 * - refresh        → emitted when Refresh button is clicked
 * - statusChange   → emitted when filter changes
 */
@Component({
  selector: 'app-booking-queue-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <app-table-ui
      [columns]="visibleColumns"
      [data]="pagedBookings"
      [actions]="queueActions"
      [fillFewRows]="false"
      (actionTriggered)="handleAction($event)"
      (viewAction)="handleView($event)"
    >
    </app-table-ui>
  `,
})
export class BookingQueueTableComponent implements OnInit, OnChanges {
  /* ==========================================================
     INPUTS
     ========================================================== */

  /** All bookings (used for count display). */
  @Input() bookings: any[] = [];

  /** Current page of bookings to display in the table. */
  @Input() pagedBookings: any[] = [];

  /** Shows a loading state. */
  @Input() isLoading = false;

  /** Label of the active filter (e.g. 'All', 'Pending'). */
  @Input() activeFilterLabel = 'All';

  /** Value of the active filter. */
  @Input() selectedFilter = 'All';

  /** Status filter options for the dropdown. */
  @Input() statusOptions: Array<{ label: string; value: string }> = [];

  /** Current page number. */
  @Input() currentPage = 1;

  /** Total number of pages. */
  @Input() totalPages = 1;

  /** Page number buttons to render. */
  @Input() pageNumbers: number[] = [];

  /** Last item index on the current page. */
  @Input() showingEnd = 0;

  /**
   * When true, shows the Worker assignment column.
   * Used in admin views where workers can be assigned to bookings.
   */
  @Input() showWorkerAssignment = false;
  /** Show or hide the Actions column. */
  @Input() showActions = true;
  /* ==========================================================
     OUTPUTS
     ========================================================== */

  @Output() refresh = new EventEmitter<void>();
  @Output() statusChange = new EventEmitter<string>();
  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();

  /** Emitted when Approve action is triggered for a booking. */
  @Output() approve = new EventEmitter<any>();

  /** Emitted when Cancel action is triggered for a booking. */
  @Output() cancel = new EventEmitter<any>();

  /** Emitted when Assign Worker is triggered for a booking. */
  @Output() assignWorker = new EventEmitter<any>();

  /** Emitted when a worker is removed from a booking. */
  @Output() unassignWorker = new EventEmitter<any>();

  /* ==========================================================
     ACTION MENU CONFIGURATION
     ========================================================== */

  readonly queueActions: TableAction[] = [
    {
      label: 'Approve',
      actionKey: 'approve',
      class: 'text-emerald-600 hover:bg-emerald-50',
    },
    {
      label: 'Cancel',
      actionKey: 'cancel',
      class: 'text-rose-500 hover:bg-rose-50',
    },
  ];

  /* ==========================================================
     COLUMN CONFIGURATION
     ========================================================== */

  private readonly baseColumns: TableColumn[] = [
    {
      key: 'participantName',
      label: 'Participant',
      type: 'participant',
    },
    {
      key: 'serviceName',
      label: 'Service',
      type: 'service',
    },
    {
      key: 'preferredDate',
      label: 'Date & Time',
      type: 'datetime',
    },
    {
      key: 'notes',
      label: 'Notes',
      type: 'notes',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
    },
    {
      key: 'assignedWorkerName',
      label: 'Worker',
      type: 'worker',
    },
    {
      key: 'action',
      label: 'Actions',
      type: 'action',
    },
  ];

  visibleColumns: TableColumn[] = [];

  /* ==========================================================
     LIFECYCLE
     ========================================================== */

  ngOnInit(): void {
    this.updateColumns();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showWorkerAssignment'] || changes['showActions']) {
      this.updateColumns();
    }
  }

  /* ==========================================================
     ACTION HANDLER
     ========================================================== */

  handleAction(event: { row: any; actionKey: string }): void {
    console.log('[BookingQueueTable] handleAction:', event);

    switch (event.actionKey) {
      case 'approve':
        this.approve.emit(event.row);
        break;
      case 'cancel':
        this.cancel.emit(event.row);
        break;
      case 'assignWorker':
        this.assignWorker.emit(event.row);
        break;
      case 'unassignWorker':
        this.unassignWorker.emit(event.row);
        break;
      default:
        console.warn(
          '[BookingQueueTable] Unhandled actionKey:',
          event.actionKey,
        );
    }
  }

  handleView(row: any): void {
    // Notes view — parent can listen to this if needed
    console.log('[BookingQueueTable] viewNotes:', row);
  }

  /* ==========================================================
     COLUMN VISIBILITY
     ========================================================== */

  private updateColumns(): void {
    this.visibleColumns = this.baseColumns.filter((col) => {
      if (!this.showWorkerAssignment && col.type === 'worker') {
        return false;
      }

      if (!this.showActions && col.type === 'action') {
        return false;
      }

      return true;
    });
  }
}
