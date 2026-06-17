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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.isPublicView = data['public'] === true;
    });

    const serviceId = this.route.snapshot.paramMap.get('id');
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
