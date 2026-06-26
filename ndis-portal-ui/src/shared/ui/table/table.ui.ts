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
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() fillFewRows = true;

  /* ===============================
     OUTPUT EVENTS
     =============================== */
  @Output() viewAction = new EventEmitter<any>();
  @Output() cancelAction = new EventEmitter<any>();
  @Output() toggleAction = new EventEmitter<any>();

  /* ===============================
     LOCAL STATE
     =============================== */
  activeMenuRow: any = null;
  replaceActionRow: any = null;
  expandedNotesRows: Set<any> = new Set();

  constructor(private eRef: ElementRef) {}

  /* ==========================================================
     COLUMN WIDTH SYSTEM
     Each type gets a relative weight. Widths are calculated
     as percentages of the total weight of active columns,
     so any combination always fills 100% of the table.
     ========================================================== */

  private readonly columnWeights: Record<string, number> = {
    action: 1,
    toggle: 2,
    status: 2,
    view: 2,
    date: 2.5,
    category: 3,
    name: 3.5,
    service: 3.5,
    notes: 5,
  };

  private readonly columnMinWidths: Record<string, string> = {
    action: '48px',
    toggle: '100px',
    status: '90px',
    view: '72px',
    date: '110px',
    category: '120px',
    name: '140px',
    service: '140px',
    notes: '180px',
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
     ACTION MENU LOGIC
     ========================================================== */

  emitAction(row: any, actionKey?: string): void {
    const payload = actionKey ? { row, action: actionKey } : row;
    this.cancelAction.emit(payload);
    this.activeMenuRow = null;
    this.replaceActionRow = null;
  }

  getActionConfig() {
    const actionCol = this.columns?.find((col) => col.type === 'action');
    return Array.isArray(actionCol?.actionLabel) ? actionCol.actionLabel : null;
  }

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
     UTILITIES
     ========================================================== */

  getValue(row: any, key: string): any {
    return row ? row[key] : '';
  }

  formatName(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
  }

  get hasActionColumn(): boolean {
    return this.columns.some((col) => col.type === 'action');
  }

  toggleMenu(row: any): void {
    this.replaceActionRow = null;
    this.activeMenuRow = this.activeMenuRow === row ? null : row;
  }

  emitToggle(row: any): void {
    this.toggleAction.emit(row);
  }

  /* ==========================================================
     NOTES EXPAND/COLLAPSE LOGIC
     ========================================================== */

  toggleNotes(row: any): void {
    if (this.expandedNotesRows.has(row)) {
      this.expandedNotesRows.delete(row);
    } else {
      this.expandedNotesRows.add(row);
    }
  }

  isNotesExpanded(row: any): boolean {
    return this.expandedNotesRows.has(row);
  }

  truncateNotes(value: string, maxLen: number = 100): string {
    if (!value) return '';
    return value.length > maxLen ? value.substring(0, maxLen) + '...' : value;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.activeMenuRow = null;
      this.replaceActionRow = null;
    }
  }
}
