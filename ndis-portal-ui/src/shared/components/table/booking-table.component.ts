import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

import { TableComponent } from '../../ui/table/table.ui';
import { TableColumn, TableAction } from '../../models/table.model';

/**
 * BookingTableComponent
 *
 * A domain-specific wrapper around the generic <app-table-ui>.
 * This component owns booking-specific concerns:
 *
 * - Which columns are visible per filter (pending, approved, cancelled, all)
 * - Which action menu items to show
 * - How to translate generic actionTriggered events into specific outputs
 *   (cancelBooking, and any future booking actions)
 *
 * The generic <app-table-ui> stays completely unaware of bookings —
 * it just renders whatever columns/data/actions it receives.
 *
 * ADDING A NEW ACTION:
 * --------------------
 * 1. Add a new entry to bookingActions[] with a unique actionKey.
 * 2. Add a matching case in handleAction() to emit or call the right handler.
 * 3. Add a new @Output() if the parent page needs to react to it.
 *
 * EXAMPLE — adding an "Edit" action:
 *   bookingActions = [
 *     { label: 'Edit',   actionKey: 'edit',   class: 'text-blue-600 hover:bg-blue-50' },
 *     { label: 'Cancel', actionKey: 'cancel', class: 'text-rose-500 hover:bg-rose-50' },
 *   ];
 *
 *   @Output() editBooking = new EventEmitter<any>();
 *
 *   handleAction(event: { row: any; actionKey: string }): void {
 *     if (event.actionKey === 'edit')   this.editBooking.emit(event.row);
 *     if (event.actionKey === 'cancel') this.cancelBooking.emit(event.row);
 *   }
 */
@Component({
  selector: 'app-booking-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <app-table-ui
      [columns]="visibleColumns"
      [data]="bookings"
      [actions]="bookingActions"
      [fillFewRows]="false"
      (viewAction)="viewBooking.emit($event)"
      (actionTriggered)="handleAction($event)"
    >
    </app-table-ui>
  `,
})
export class BookingTableComponent implements OnInit, OnChanges {
  /* ==========================================================
     INPUTS
     ========================================================== */

  /** Booking rows to display in the table. */
  @Input() bookings: any[] = [];

  /**
   * Currently active status filter.
   *
   * Drives which columns are shown (e.g. action column is only
   * visible on the 'pending' filter).
   *
   * Accepted values: 'all' | 'pending' | 'approved' | 'cancelled'
   */
  @Input() currentFilter: string = 'all';

  /* ==========================================================
     OUTPUTS
     ========================================================== */

  /** Emitted when the user clicks the View button on a row. */
  @Output() viewBooking = new EventEmitter<any>();

  /**
   * Emitted when the user clicks Cancel in the action dropdown.
   * The parent page (my-bookings.page.ts) listens to this and
   * opens the cancel confirmation dialog.
   */
  @Output() cancelBooking = new EventEmitter<any>();

  /* ==========================================================
     ACTION MENU CONFIGURATION

     These are passed directly to <app-table-ui> via [actions].
     The table renders one button per item in the dropdown.

     actionKey must be unique per action — it's what handleAction()
     switches on to determine which output to emit.
     ========================================================== */

  readonly bookingActions: TableAction[] = [
    {
      label: 'Cancel',
      actionKey: 'cancel',
      class: 'text-rose-500 hover:bg-rose-50',
    },
    /*
     * Add more booking actions here as needed:
     *
     * {
     *   label: 'Reschedule',
     *   actionKey: 'reschedule',
     *   class: 'text-blue-600 hover:bg-blue-50',
     * },
     */
  ];

  /* ==========================================================
     TABLE COLUMN CONFIGURATION

     baseColumns is the full list of possible columns.
     visibleColumns is the filtered subset actually rendered,
     updated via updateColumns() whenever currentFilter changes.
     ========================================================== */

  /**
   * Master column list — never mutated directly.
   * updateColumns() derives visibleColumns from this.
   */
  private readonly baseColumns: TableColumn[] = [
    {
      key: 'service',
      label: 'Service',
      type: 'service',
    },
    {
      key: 'category',
      label: 'Category',
      type: 'category',
    },
    {
      key: 'date',
      label: 'Booking Date',
      type: 'date',
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
      key: 'action',
      label: 'Actions',
      type: 'action',
    },
  ];

  /** The columns currently passed to <app-table-ui>. */
  visibleColumns: TableColumn[] = [];

  /* ==========================================================
     LIFECYCLE
     ========================================================== */

  /**
   * Called once on component init.
   * Needed because ngOnChanges won't fire for the initial
   * value of currentFilter when it's set as a static string.
   */
  ngOnInit(): void {
    this.updateColumns();
  }

  /**
   * Called whenever any @Input() changes.
   * Re-evaluates column visibility when the filter changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentFilter']) {
      this.updateColumns();
    }
  }

  /* ==========================================================
     ACTION HANDLER

     Receives the generic { row, actionKey } payload from
     <app-table-ui>'s (actionTriggered) output and dispatches
     to the correct domain-specific output.

     This is the single place to map actionKey → behavior.
     To add a new action: add a case here and a matching @Output().
     ========================================================== */

  handleAction(event: { row: any; actionKey: string }): void {
    console.log('[BookingTable] handleAction received:', event);

    switch (event.actionKey) {
      case 'cancel':
        console.log(
          '[BookingTable] Emitting cancelBooking for row:',
          event.row,
        );
        this.cancelBooking.emit(event.row);
        break;

      default:
        console.warn('[BookingTable] Unhandled actionKey:', event.actionKey);
    }
  }

  /* ==========================================================
     COLUMN VISIBILITY RULES

     BUSINESS RULE:
     - pending    → show Action column (user can cancel)
     - all        → hide Action column
     - approved   → hide Action column
     - cancelled  → hide Action column

     Reasoning: cancelled/approved bookings can't be acted on,
     and 'all' is a read-only overview.
     ========================================================== */

  private updateColumns(): void {
    const filter = (this.currentFilter || 'all').toLowerCase();
    console.log('[BookingTable] updateColumns — filter:', filter);

    if (filter === 'pending') {
      // Show all columns including the action menu
      this.visibleColumns = [...this.baseColumns];
    } else {
      // Hide the action column for non-actionable states
      this.visibleColumns = this.baseColumns.filter(
        (col) => col.type !== 'action',
      );
    }
  }
}
