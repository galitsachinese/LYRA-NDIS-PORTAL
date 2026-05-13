// services-list.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardComponent, ServiceItem } from '../../../../shared/components/card/service-card/service-card.component';
import { ApiService } from '../../../core/services/api-service';


@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './services-list.page.html',
  styleUrls: ['./services-list.page.css'],
})
export class ServicesListComponent implements OnInit {
  allServices: ServiceItem[] = [];
  filteredServices: ServiceItem[] = [];
  categories: string[] = [];
  selectedCategory = 'all';
  isLoading = false;

  // FIXED: Ensure keys here match the normalized output of your API strings
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
  ) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.isLoading = true;

    this.api.getServices().subscribe({
      next: (res: any) => {
        const services = res?.Data ?? res;

        if (Array.isArray(services)) {
          this.allServices = services.map((service: any) => {
            // 1. Get raw name or fallback
            const categoryName =
              service.categoryName ||
              service.category_name ||
              service.category?.name ||
              service.category ||
              'Support';

            // 2. Normalize: Lowercase and replace spaces/special chars with dashes
            const normalizedCategory = this.normalizeCategory(categoryName);

            return {
              id: service.id,
              name: service.name || service.title,
              category: categoryName,
              description: service.description,
              // 3. Match against map, fallback to 'default'
              icon: this.categoryIconMap[normalizedCategory] || 'default',
            };
          });

          this.updateCategories();
          this.selectedCategory = 'all';
          this.filteredServices = [...this.allServices];
        }

        this.isLoading = false;
      },
      error: () => {
        this.allServices = [];
        this.filteredServices = [];
        this.categories = [];
        this.isLoading = false;
      },
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    const target = this.normalizeCategory(category);

    this.filteredServices =
      target === 'all'
        ? [...this.allServices]
        : this.allServices.filter(
            (s) => this.normalizeCategory(s.category) === target,
          );
  }

  trackByCategory(_index: number, category: string) {
    return category;
  }

  onCardClick(service: ServiceItem) {
    this.router.navigate(['/services', service.id]);
  }

  private updateCategories() {
    const uniqueCategories = new Map<string, string>();

    this.allServices.forEach((service) => {
      const category = service.category?.trim();

      if (category) {
        uniqueCategories.set(this.normalizeCategory(category), category);
      }
    });

    this.categories = Array.from(uniqueCategories.values());
  }

  private normalizeCategory(category: string) {
    return category.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  }
}
