import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../shared/components/card/card.component'; // Double check this path!
import { CategoryDropdownComponent } from '../../../shared/components/dropdown/category/category-dropdown.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent, // This must be here to use <app-card-component>
    CategoryDropdownComponent,
    PaginationComponent,
  ],
  templateUrl: './services-list.page.html',
  styleUrl: './services-list.page.css',
})
export class ServicesListComponent {
  currentPage = 1;

  activeFilter = 'all';

  allBookings = [
    {
      service: 'Personal Hygiene Assistance', // Matches card title
      category: 'Daily Personal Activities', // Matches card tag
      description:
        'Comprehensive building upkeep including HVAC, electrical, and plumbing inspections.', // Match image text
      date: 'Apr 21, 2026',
      status: 'Approved',
    },
    {
      service: 'Personal Hygiene Assistance', // Matches card title
      category: 'Daily Personal Activities', // Matches card tag
      description:
        'Comprehensive building upkeep including HVAC, electrical, and plumbing inspections.', // Match image text
      date: 'Apr 21, 2026',
      status: 'Approved',
    },
    {
      service: 'Personal Hygiene Assistance', // Matches card title
      category: 'Daily Personal Activities', // Matches card tag
      description:
        'Comprehensive building upkeep including HVAC, electrical, and plumbing inspections.', // Match image text
      date: 'Apr 21, 2026',
      status: 'Approved',
    },
    {
      service: 'Personal Hygiene Assistance', // Matches card title
      category: 'Daily Personal Activities', // Matches card tag
      description:
        'Comprehensive building upkeep including HVAC, electrical, and plumbing inspections.', // Match image text
      date: 'Apr 21, 2026',
      status: 'Approved',
    },
    {
      service: 'Personal Hygiene Assistance',
      category: 'Daily Personal Activities',
      description:
        'Comprehensive building upkeep including HVAC, electrical, and plumbing inspections.',
      date: 'Apr 21, 2026',
      status: 'Pending',
    },
  ];

  filteredBookings = [...this.allBookings];

  handleCategoryFilter(category: string) {
    this.activeFilter = category;
    if (category === 'all') {
      this.filteredBookings = [...this.allBookings];
    } else {
      this.filteredBookings = this.allBookings.filter(
        (b) => b.category.toLowerCase() === category.toLowerCase(),
      );
    }
  }

  handlePageChange(page: number) {
    this.currentPage = page;
    // Call your API here to fetch data for the new page
  }
}
