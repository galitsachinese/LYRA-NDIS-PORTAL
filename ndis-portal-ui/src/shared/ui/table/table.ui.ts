import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { TableColumn } from '../../models/table.model';

@Component({
  selector: 'app-table-ui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.ui.html',
})
export class TableComponent {
  /* ===============================
     INPUTS
     =============================== */

  // Columns definition
  @Input() columns: TableColumn[] = [];

  // Table data
  @Input() data: any[] = [];
  @Input() fillFewRows = true;

  /* ===============================
     OUTPUT EVENTS
     =============================== */

  // View action emitter
  @Output() viewAction = new EventEmitter<any>();

  // Cancel / Multi-action emitter
  @Output() cancelAction = new EventEmitter<any>();

  // Toggle action emitter for status toggle
  @Output() toggleAction = new EventEmitter<any>();

  /* ===============================
     LOCAL STATE
     =============================== */

  // Currently opened action menu row
  activeMenuRow: any = null;
  replaceActionRow: any = null;

  constructor(private eRef: ElementRef) {}

  /* ==========================================================
     🔥 FIX: SMART COLUMN WIDTH LOGIC
     This allows table to auto-fit based on called columns
     WITHOUT breaking existing components
     ========================================================== */

  /**
   * Tailwind-based column sizing
   * NO px used
   */
  /**
   * Balanced Tailwind sizing
   * Allows shrinking before scrolling
   */
  getColumnClass(col: TableColumn): string {
    switch (col.type) {
      // Smallest column
      case 'action':
        return 'w-[7%] min-w-14 text-center';

      // Status column
      case 'status':
        return 'w-[11%] min-w-24';

      // Date column
      case 'date':
        return 'w-[14%] min-w-28';

      // Category column
      case 'category':
        return 'w-[17%] min-w-32';

      // View column
      case 'view':
        return 'w-1/12 min-w-20';

      // Notes column
      case 'notes':
        return 'w-[35%] min-w-56';

      // Toggle column (actions with toggle button)
      case 'toggle':
        return 'w-1/6 min-w-36 text-center';

      default:
        // Primary columns
        if (col.key === 'name' || col.key === 'service') {
          return 'w-[16%] min-w-40';
        }

        // Default
        return 'w-1/10 min-w-24';
    }
  }

  /* ==========================================================
     ACTION MENU LOGIC
     Supports:
     - Single action
     - Multi-action
     ========================================================== */

  emitAction(row: any, actionKey?: string): void {
    const payload = actionKey ? { row, action: actionKey } : row;

    this.cancelAction.emit(payload);

    // Close menu
    this.activeMenuRow = null;
    this.replaceActionRow = null;
  }

  /* Get multi-actions if exists */
  getActionConfig() {
    const actionCol = this.columns?.find((col) => col.type === 'action');

    return Array.isArray(actionCol?.actionLabel) ? actionCol.actionLabel : null;
  }

  /* Get fallback single action */
  getActionLabel(): string {
    const actionCol = this.columns?.find((col) => col.type === 'action');

    return typeof actionCol?.actionLabel === 'string'
      ? actionCol.actionLabel
      : 'Cancel';
  }

  get actionColumn(): TableColumn | undefined {
    return this.columns?.find((col) => col.type === 'action');
  }

  shouldReplaceAction(row: any): boolean {
    return (
      this.actionColumn?.actionDisplay === 'replace-with-action' &&
      this.replaceActionRow === row
    );
  }

  handleActionTrigger(row: any, event: MouseEvent): void {
    event.stopPropagation();

    if (this.actionColumn?.actionDisplay === 'replace-with-action') {
      this.activeMenuRow = null;
      this.replaceActionRow = this.replaceActionRow === row ? null : row;
      return;
    }

    this.toggleMenu(row);
  }

  /* Get action column header label */
  getActionColumnLabel(): string {
    const actionCol = this.columns?.find((col) => col.type === 'action');

    return actionCol?.label || 'Action';
  }

  /* ==========================================================
     STATUS COLOR LOGIC
     ========================================================== */

  getStatusClasses(status: string): string {
    const s = status?.toLowerCase();

    switch (s) {
      case 'approved':
      case 'active':
        return 'bg-[#dcfce7] text-[#289839]';

      case 'pending':
        return 'bg-[#fb7a4b] text-white';

      case 'cancelled':
      case 'inactive':
        return 'bg-[#fee2e2] text-[#b91c1c]';

      default:
        return 'text-slate-700';
    }
  }

  /* ==========================================================
     SAFE VALUE ACCESS
     ========================================================== */

  getValue(row: any, key: string): any {
    return row ? row[key] : '';
  }

  /* Check if action column exists */
  get hasActionColumn(): boolean {
    return this.columns.some((col) => col.type === 'action');
  }

  /* Toggle menu open/close */
  toggleMenu(row: any): void {
    this.replaceActionRow = null;
    this.activeMenuRow = this.activeMenuRow === row ? null : row;
  }

  /* Emit toggle action for status changes */
  emitToggle(row: any): void {
    this.toggleAction.emit(row);
  }

  /* Close menu when clicking outside */
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.activeMenuRow = null;
      this.replaceActionRow = null;
    }
  }
}
