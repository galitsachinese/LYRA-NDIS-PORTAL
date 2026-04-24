import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Importing your specific Tabler-style icons
import { HomeIconComponent } from '../../components/icons/svg-icons/home-icon';
import { BookIconComponent } from '../../components/icons/svg-icons/book-icon';
import { ServiceIconComponent } from '../../components/icons/svg-icons/service-icon';

export interface NavItem {
  label: string;
  path: string;
  icon: 'home' | 'services' | 'bookings';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HomeIconComponent,
    BookIconComponent,
    ServiceIconComponent,
  ],
  templateUrl: './sidebar.ui.html',
  styleUrl: './sidebar.ui.css',
})
export class SidebarComponent {
  @Input() navItems: NavItem[] = [];
  @Input() subText: string = 'Enterprise'; // Default sub-text
}
