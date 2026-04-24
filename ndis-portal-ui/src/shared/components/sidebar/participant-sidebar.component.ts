import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, NavItem } from '../../ui/sidebar/sidebar.ui';

@Component({
  selector: 'app-participant-sidebar',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <app-sidebar [navItems]="participantLinks" subText="Participant Portal">
    </app-sidebar>
  `,
})
export class ParticipantSidebarComponent {
  // Define the specific links for a Participant
  participantLinks: NavItem[] = [    {
      label: 'Services',
      path: '/services',
      icon: 'services',
    },
    { label: 'My Bookings', path: '/bookings', icon: 'bookings' },
  ];
}
