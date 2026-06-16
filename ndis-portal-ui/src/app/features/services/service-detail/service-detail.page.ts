// service-detail.page.ts  ← FIXED

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api-service';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonUiComponent } from '../../../../shared/ui/button/button.ui';
import { ServiceItemComponent } from '../../../../shared/components/service-item/service-item.component';
import { BookButton } from '../../../../shared/components/button/book-button/book-button.component';
import { BackButton } from '../../../../shared/components/button/back-button/back-button.component';

@Component({
  selector: 'app-service-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonUiComponent,
    ServiceItemComponent,
    BookButton,
    BackButton,
  ],
  templateUrl: './service-detail.page.html',
})
export class ServiceDetailComponent implements OnInit {
  serviceData: any = null;
  includes: any[] = [];
  isLoading = true;
  isPublicView = false; // ← NEW
  showAuthModal = false; // ← NEW: controls the login/signup modal

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private authService: AuthService, // ← NEW
  ) {}

  ngOnInit() {

    console.log('====================');
    console.log('SERVICE DETAIL LOADED');
    console.log('Current URL:', this.router.url);

    this.route.data.subscribe((data) => {
      console.log('Route Data:', data);
      this.isPublicView = data['public'] === true;
    });
    
    // Detect public vs protected route via route data (mirrors services-list logic)
    this.route.data.subscribe((data) => {
      this.isPublicView = data['public'] === true;
    });

    const serviceId = this.route.snapshot.paramMap.get('id');
    console.log('Service ID:', serviceId);
    if (serviceId) {
      this.api.getServiceById(Number(serviceId)).subscribe({
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
  }

  navBack() {
    window.history.back();
  }

  /**
   * Smart booking handler:
   * - Public + not logged in  → show auth modal
   * - Public + logged in      → proceed to booking
   * - Protected (participant) → proceed to booking (AuthGuard already confirmed auth)
   */
  processBooking() {
    if (this.isPublicView && !this.authService.isAuthenticated()) {
      this.showAuthModal = true; // ← show modal instead of navigating
      return;
    }

    this.router.navigate(['/participant/book-service'], {
      queryParams: { serviceId: this.serviceData?.id },
    });
  }

  closeModal() {
    this.showAuthModal = false;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
