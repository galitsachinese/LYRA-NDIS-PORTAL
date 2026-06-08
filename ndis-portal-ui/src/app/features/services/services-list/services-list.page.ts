import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  CardComponent,
  ServiceItem,
} from '../../../../shared/components/card/service-card/service-card.component';
import { CategoryDropdownComponent } from '../../../../shared/components/dropdown/category/category-dropdown.component';
import { ApiService } from '../../../core/services/api-service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule, CardComponent, CategoryDropdownComponent],
  templateUrl: './services-list.page.html',
})
export class ServicesListComponent implements OnInit {
  allServices: ServiceItem[] = [];
  filteredServices: ServiceItem[] = [];
  isLoading = true;
  isPublicView = false; // Flag to detect route

  constructor(
    private router: Router,
    private api: ApiService,
    private authService: AuthService,
  ) {
    // Determine if the user is in the public "explore" branch
    this.isPublicView = this.router.url.includes('/explore/');
  }

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.isLoading = true;
    this.api.getServices().subscribe({
      next: (res: any) => {
        if (res?.Data && Array.isArray(res.Data)) {
          this.allServices = res.Data.map((s: any) => ({
            id: s.id,
            name: s.name || s.title,
            category: s.categoryName || 'support',
            description: s.description,
            icon: 'default',
          }));
          this.filteredServices = [...this.allServices];
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  /**
   * Smart Interceptor:
   * 1. If Public: Navigate to public details
   * 2. If Logged In: Navigate to booking flow
   * 3. If Guest in dashboard: Redirect to login
   */
  onCardClick(service: ServiceItem) {
    const serviceId = String(service.id);

    if (this.isPublicView) {
      // Browsing publicly: go to public detail view
      this.router.navigate(['/explore/services', serviceId]);
    } else if (this.authService.isAuthenticated()) {
      // Logged in: go to booking flow
      this.router.navigate(['/services', serviceId, 'book']);
    } else {
      // Not logged in: go to login
      this.router.navigate(['/login']);
    }
  }

  handleCategoryFilter(category: string) {
    const target = category
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-');
    this.filteredServices =
      target === 'all'
        ? [...this.allServices]
        : this.allServices.filter((s) =>
            s.category.toLowerCase().includes(target),
          );
  }
}
