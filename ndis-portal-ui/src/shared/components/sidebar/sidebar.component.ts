import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarUi, NavItem } from '../../ui/sidebar/sidebar.ui';
import { AuthService } from '../../../app/core/services/auth.service';

@Component({
  selector: 'app-sidebar-component',
  standalone: true,
  imports: [CommonModule, SidebarUi],
  template: `
    <app-sidebar-ui
      [navItems]="filteredLinks"
    ></app-sidebar-ui>
  `,
  host: { class: 'block h-full flex-none transition-all duration-300' },
})
export class SidebarComponent {
  constructor(private authService: AuthService) {}

  private allLinks: (NavItem & { role: string })[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      role: 'Coordinator',
    },
    {
      label: 'Manage Services',
      path: '/dashboard/services',
      icon: 'services',
      role: 'Coordinator',
    },
    {
      label: 'Support Workers',
      path: '/dashboard/support-workers',
      icon: 'support',
      role: 'Coordinator',
    },
    {
      label: 'All Bookings',
      path: '/dashboard/bookings',
      icon: 'bookings',
      role: 'Coordinator',
    },
    {
      label: 'Services',
      path: '/services',
      icon: 'services',
      role: 'Participant',
    },
    {
      label: 'Book a Service',
      path: '/participant/book-service',
      icon: 'book-new',
      role: 'Participant',
    },
    {
      label: 'My Bookings',
      path: '/bookings',
      icon: 'bookings',
      role: 'Participant',
    },
  ];

  get filteredLinks(): NavItem[] {
    const userRole = this.authService.getRole();

    if (!userRole) {
      return [];
    }

    const filtered = this.allLinks.filter(
      (link) => link.role.toLowerCase() === userRole.toLowerCase(),
    );

    return filtered.filter(
      (link, index, self) =>
        index === self.findIndex((item) => item.path === link.path),
    );
  }
}
