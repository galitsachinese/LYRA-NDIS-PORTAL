import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  /**
   * Detect initial screen size.
   * Sidebar starts collapsed on mobile, expanded on desktop.
   */
  private isMobile = window.innerWidth < 768;

  /**
   * Central state for sidebar collapse.
   * This is the SINGLE source of truth.
   */
  private collapsed = new BehaviorSubject<boolean>(this.isMobile);

  /**
   * Observable used by components to react to sidebar changes.
   */
  collapsed$ = this.collapsed.asObservable();

  /**
   * Returns current sidebar state snapshot.
   */
  get isCollapsed(): boolean {
    return this.collapsed.value;
  }

  /**
   * Toggle sidebar state manually (used by button click).
   */
  toggle(): void {
    this.collapsed.next(!this.collapsed.value);
  }

  /**
   * Force expand sidebar.
   */
  expand(): void {
    this.collapsed.next(false);
  }

  /**
   * Force collapse sidebar.
   */
  collapse(): void {
    this.collapsed.next(true);
  }

  /**
   * Auto-close sidebar ONLY on mobile after navigation click.
   */
  autoCloseOnMobile(): void {
    if (this.isMobile) {
      this.collapsed.next(true);
    }
  }
}
