// services-list.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// UI Components
import { ServiceCardComponent, ServiceItem } from '../../../../shared/components/card/service-card/service-card.component';
import { FilterBarComponent } from '../../../../shared/components/dropdown/category/filter-bar.component';

// Services
import { ApiService } from '../../../core/services/api-service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule, ServiceCardComponent, FilterBarComponent],
  templateUrl: './services-list.page.html',
})
export class ServicesListComponent implements OnInit {
  allServices: ServiceItem[] = [];
  filteredServices: ServiceItem[] = [];

  categoryOptions: { label: string; value: string }[] = [];
  selectedCategory = 'all';

  isLoading = true;
  isPublicView = false;

  private categoryIconMap: { [key: string]: string } = {
    'therapy-supports': 'therapy',
    'community-access': 'community',
    'respite-care': 'care',
    'support-coordination': 'support',
    'daily-personal-activities': 'activity',
  };

  constructor(
    private router: Router,
    private api: ApiService,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // FIXED PUBLIC DETECTION
    this.route.data.subscribe((data) => {
      this.isPublicView = data['public'] === true;
    });

    this.loadServices();
  }

  // =========================
  // LOAD SERVICES
  // =========================
  loadServices() {
    this.isLoading = true;

    this.api.getServices().subscribe({
      next: (res: any) => {
        const data = res.Data || [];

        this.allServices = data.map((s: any) => {
          const categoryName = s.categoryName || 'support';

          const normalizedCategory = categoryName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-');

          return {
            id: s.id,
            name: s.name || s.title,
            category: categoryName,
            description: s.description,
            icon: this.categoryIconMap[normalizedCategory] || 'default',
          };
        });

        this.filteredServices = [...this.allServices];

        const uniqueCategories = [
          ...new Set(this.allServices.map((s) => s.category)),
        ];

        this.categoryOptions = [
          { label: 'All Services', value: 'all' },
          ...uniqueCategories.map((cat) => ({
            label: cat,
            value: cat.toLowerCase(),
          })),
        ];

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  // =========================
  // FILTER
  // =========================
  handleCategoryFilter(value: string) {
    this.selectedCategory = value;

    if (value === 'all') {
      this.filteredServices = [...this.allServices];
      return;
    }

    this.filteredServices = this.allServices.filter(
      (s) => s.category.toLowerCase() === value.toLowerCase(),
    );
  }

  // =========================
  // NAVIGATION
  // =========================
  onCardClick(service: ServiceItem) {
    const id = String(service.id);

    if (this.isPublicView) {
      this.router.navigate(['/explore/services', id]);
    } else if (this.authService.isAuthenticated()) {
      this.router.navigate(['/services', id]);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
