import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api-service';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonUiComponent } from '../../../../shared/ui/button/button.ui';
import { ServiceItemComponent } from '../../../../shared/components/service-item/service-item.component';
import { BookButton } from '../../../../shared/components/button/book-button/book-button.component';
import { BackButton } from '../../../../shared/components/button/back-button/back-button.component';
import { AuthModalComponent } from '../../../../shared/components/modals/auth-modal/auth-modal.component';

@Component({
  selector: 'app-service-detail-page',
  standalone: true,
  // Ensure your imports array looks like this:
  imports: [
    CommonModule,
    ButtonUiComponent,
    ServiceItemComponent,
    BookButton,
    BackButton,
    AuthModalComponent,
  ],
  templateUrl: './service-detail.page.html',
})
export class ServiceDetailComponent implements OnInit {
  serviceData: any = null;
  includes: any[] = [];
  isLoading = true;
  isPublicView = false;
  showAuthModal = false;

  // Navigation state
  allServiceIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // Determine view type
    this.route.data.subscribe((data) => {
      this.isPublicView = data['public'] === true;
    });

    // 1. Fetch all IDs first so we can navigate
    this.api.getServices().subscribe({
      next: (res: any) => {
        this.allServiceIds = (res.Data || []).map((s: any) => s.id);

        // 2. Subscribe to param changes so we reload when clicking Next/Prev
        this.route.params.subscribe((params) => {
          this.loadServiceDetail(Number(params['id']));
        });
      },
    });
  }

  loadServiceDetail(id: number) {
    this.isLoading = true;
    this.api.getServiceById(id).subscribe({
      next: (res: any) => {
        const data = res.Data;
        this.serviceData = {
          id: data.id,
          title: data.name || data.title,
          category: data.categoryName,
          description: data.description,
        };
        this.includes = (data.items || []).map((item: any) => ({
          name: item.name || item,
          icon: item.icon || 'pi pi-check',
        }));
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  // --- Navigation Helpers ---

  getPrevId(): number | null {
    if (!this.serviceData) return null;
    const index = this.allServiceIds.indexOf(this.serviceData.id);
    return index > 0 ? this.allServiceIds[index - 1] : null;
  }

  getNextId(): number | null {
    if (!this.serviceData) return null;
    const index = this.allServiceIds.indexOf(this.serviceData.id);
    return index < this.allServiceIds.length - 1
      ? this.allServiceIds[index + 1]
      : null;
  }

  navigateTo(id: number) {
    const path = this.isPublicView ? '/explore/services' : '/services';
    this.router.navigate([path, id]);
  }

  navBack() {
    window.history.back();
  }

  processBooking() {
    if (this.isPublicView && !this.authService.isAuthenticated()) {
      this.showAuthModal = true;
      return;
    }

    this.router.navigate(['/participant/book-service'], {
      queryParams: { serviceId: this.serviceData?.id },
    });
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }

  onAuthSuccess() {
    this.showAuthModal = false;
  }
}
