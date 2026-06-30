import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { TableColumn, TableAction } from '../../models/table.model';

/**
 * Generic, reusable table UI component.
 *
 * This component is intentionally "dumb" — it knows nothing about
 * bookings, admins, or any domain. It renders columns and rows, and
 * delegates all action logic back to the parent via events.
 *
 * SUPPORTED COLUMN TYPES:
 * -----------------------
 * name        → bold text, truncated
 * service     → bold text, truncated
 * participant → avatar initials + name
 * date        → formatted date string
 * datetime    → date on top, time below (uses pipe in parent)
 * category    → grey badge
 * status      → colored dot badge
 * notes       → truncated text, click to view (emits viewAction)
 * worker      → assigned worker chip or assign button
 * view        → "View" button (emits viewAction)
 * toggle      → on/off switch (emits toggleAction)
 * action      → three-dot dropdown menu (emits actionTriggered)
 *
 * HOW TO USE:
 * -----------
 * 1. Pass [columns] to define what columns are visible.
 * 2. Pass [data] with the row objects to display.
 * 3. Pass [actions] to define what appears in the action dropdown menu.
 * 4. Listen to (actionTriggered) → { row, actionKey }
 * 5. Listen to (viewAction) for 'view' and 'notes' column types.
 * 6. Listen to (toggleAction) for the 'toggle' column type.
 * 7. Listen to (assignWorker) / (unassignWorker) for the 'worker' column type.
 */
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

  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() fillFewRows = true;

  /* ===============================
     OUTPUTS
     =============================== */

  @Output() actionTriggered = new EventEmitter<{
    row: any;
    actionKey: string;
  }>();
  @Output() viewAction = new EventEmitter<any>();
  @Output() toggleAction = new EventEmitter<any>();
  @Output() assignWorker = new EventEmitter<any>();
  @Output() unassignWorker = new EventEmitter<any>();

  /* ===============================
     LOCAL STATE
     =============================== */

  /** Tracks the ID of the row whose dropdown is open. */
  activeMenuRowId: any = null;

  constructor(private eRef: ElementRef) {}

  /* ==========================================================
     COLUMN WIDTH SYSTEM
     ========================================================== */

  private readonly columnWeights: Record<string, number> = {
    action: 1,
    toggle: 2,
    status: 2,
    view: 2,
    date: 2.5,
    datetime: 3,
    category: 3,
    name: 3.5,
    service: 3.5,
    participant: 4,
    worker: 3.5,
    notes: 2.5,
  };

  private readonly columnMinWidths: Record<string, string> = {
    action: '48px',
    toggle: '100px',
    status: '90px',
    view: '72px',
    date: '110px',
    datetime: '130px',
    category: '120px',
    name: '140px',
    service: '140px',
    participant: '160px',
    worker: '140px',
    notes: '100px',
  };

  getColumnStyle(col: TableColumn): { [key: string]: string } {
    const totalWeight = this.columns.reduce((sum, c) => {
      return (
        sum + (this.columnWeights[c.type] ?? this.columnWeights[c.key] ?? 3)
      );
    }, 0);
    const weight =
      this.columnWeights[col.type] ?? this.columnWeights[col.key] ?? 3;
    const pct =
      totalWeight > 0
        ? `${((weight / totalWeight) * 100).toFixed(2)}%`
        : 'auto';
    const minW = this.columnMinWidths[col.type] ?? '80px';
    return { width: pct, minWidth: minW };
  }

  getColumnClass(col: TableColumn): string {
    return col.type === 'action' || col.type === 'toggle' ? 'text-center' : '';
  }

  /* ==========================================================
     ACTION MENU
     ========================================================== */

  toggleMenu(row: any): void {
    const id = row?.id ?? row;
    this.activeMenuRowId = this.activeMenuRowId === id ? null : id;
  }

  emitAction(row: any, actionKey: string): void {
    console.log('[TableUI] emitAction', actionKey, row);
    this.actionTriggered.emit({ row, actionKey });
    this.activeMenuRowId = null;
  }

  get hasActionColumn(): boolean {
    return this.columns.some((col) => col.type === 'action');
  }

  /* ==========================================================
     STATUS COLOR
     ========================================================== */

  getStatusClasses(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
        return 'bg-[#dcfce7] text-[#289839]';
      case 'pending':
        return 'bg-[#fef9c3] text-[#a16207]';
      case 'cancelled':
      case 'inactive':
        return 'bg-[#fee2e2] text-[#b91c1c]';
      default:
        return 'text-slate-700';
    }
  }

  /* ==========================================================
     PARTICIPANT HELPERS
     ========================================================== */

  /** Returns 1-2 uppercase initials from a participant name. */
  getInitials(row: any): string {
    const name = row?.participantName || `U${row?.userId || '?'}`;
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p: string) => p.charAt(0).toUpperCase())
      .join('');
  }

  /** Returns a deterministic avatar color class based on row id. */
  getAvatarClass(row: any): string {
    const colors = [
      'bg-rose-100 text-rose-600',
      'bg-violet-100 text-violet-600',
      'bg-sky-100 text-sky-600',
      'bg-emerald-100 text-emerald-600',
      'bg-orange-100 text-orange-600',
    ];
    return colors[Math.abs(Number(row?.id) || 0) % colors.length];
  }

  /* ==========================================================
     WORKER HELPERS
     ========================================================== */

  getAssignedWorkerName(row: any): string {
    return (
      row?.assignedWorkerName ??
      row?.AssignedWorkerName ??
      row?.supportWorkerName ??
      row?.workerName ??
      ''
    );
  }

  hasAssignedWorker(row: any): boolean {
    return Boolean(
      row?.assignedWorkerId ??
      row?.supportWorkerId ??
      this.getAssignedWorkerName(row),
    );
  }

  /* ==========================================================
     NOTES HELPERS
     ========================================================== */

  getTruncatedNotes(row: any, col: TableColumn): string {
    const notes = row?.[col.key] || '';
    return notes.length > 80 ? notes.slice(0, 80) + '...' : notes;
  }

  hasNotes(row: any, col: TableColumn): boolean {
    return Boolean(row?.[col.key]);
  }

  /* ==========================================================
     UTILITIES
     ========================================================== */

  getValue(row: any, key: string): any {
    return row ? row[key] : '';
  }

  emitToggle(row: any): void {
    this.toggleAction.emit(row);
  }

  /* ==========================================================
     CLICK OUTSIDE
     ========================================================== */

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.activeMenuRowId = null;
    }
  }
}
