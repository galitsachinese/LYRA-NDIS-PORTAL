import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarUiComponent } from '../../ui/navbar/navbar.ui';
import { ApiService } from '../../../app/core/services/api-service';

@Component({
  selector: 'app-navbar-component',
  standalone: true,
  imports: [CommonModule, NavbarUiComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  breadcrumbs: Array<{ label: string; url: string }> = [];

  constructor(
    private router: Router,
    private api: ApiService,
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.generateBreadcrumbs();
      });
    this.generateBreadcrumbs();
  }

  private generateBreadcrumbs() {
    const path = this.router.url.split('/').filter((p) => p);
    this.breadcrumbs = path.map((segment, index) => ({
      label:
        segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
      url: '/' + path.slice(0, index + 1).join('/'),
    }));

    // If the last segment is a number (service ID), fetch and display service name
    if (path.length >= 2 && path[0] === 'services' && !isNaN(Number(path[1]))) {
      const serviceId = Number(path[1]);
      this.api.getServiceById(serviceId).subscribe({
        next: (res: any) => {
          const serviceName = res.Data?.name || res.Data?.title;
          if (serviceName && this.breadcrumbs.length >= 2) {
            this.breadcrumbs[this.breadcrumbs.length - 1].label = serviceName;
          }
        },
        error: () => {
          // Keep the ID if API call fails
        },
      });
    }
  }
}
