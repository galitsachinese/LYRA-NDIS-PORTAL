/**
 * table.model.ts
 *
 * Shared type definitions for the generic TableComponent.
 * Both TableColumn and TableAction are used as @Input() types
 * on <app-table-ui> and its domain-specific wrappers.
 */

/* ==========================================================
   TABLE COLUMN
   Defines a single column rendered by the table.
   ========================================================== */

export interface TableColumn {
  /** The property key to read from the row data object. */
  key: string;

  /** Display text shown in the column header. */
  label: string;

  /**
   * Controls how the cell is rendered.
   *
   * Built-in types:
   * - 'text'     : plain text (default fallback)
   * - 'name'     : bold text, truncated
   * - 'service'  : bold text, truncated
   * - 'date'     : no-wrap date string
   * - 'status'   : colored badge with dot
   * - 'category' : outlined badge
   * - 'view'     : "View" button, emits viewAction
   * - 'toggle'   : on/off switch, emits toggleAction
   * - 'action'   : three-dot dropdown menu, driven by [actions] input
   * - 'notes'    : plain text fallback (alias for text)
   */
  type: string;

  /**
   * @deprecated
   * Previously used to pass action labels directly on the column config.
   * Replaced by the [actions] @Input() on TableComponent.
   * Kept here temporarily to avoid breaking existing usages.
   * Remove once all consumers are migrated.
   */
  actionLabel?: string | { label: string; actionKey: string; class?: string }[];

  /**
   * @deprecated
   * Previously used to control action display mode.
   * No longer needed after the [actions] refactor.
   */
  actionDisplay?: string;
}

/* ==========================================================
   TABLE ACTION
   Defines one item in the action dropdown menu.
   Passed via [actions] @Input() on <app-table-ui>.
   ========================================================== */

export interface TableAction {
  /** Text shown on the action button. */
  label: string;

  /**
   * Unique identifier emitted with (actionTriggered) when clicked.
   * The parent component switches on this to decide what to do.
   *
   * Convention: use lowercase kebab-case (e.g. 'cancel', 'approve', 'mark-done')
   */
  actionKey: string;

  /**
   * Optional Tailwind classes to style the button.
   * Useful for danger actions (rose), confirmations (green), etc.
   *
   * Defaults to: 'text-slate-600 hover:bg-slate-50'
   *
   * Example:
   * - Danger : 'text-rose-500 hover:bg-rose-50'
   * - Success: 'text-green-600 hover:bg-green-50'
   * - Info   : 'text-blue-600 hover:bg-blue-50'
   */
  class?: string;
}
