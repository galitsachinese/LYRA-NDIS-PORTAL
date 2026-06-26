import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../../app/core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  isMobileMenuOpen = false;
  isHomePage = true; // Tracks if we are on the homepage
  navLinks: { label: string; path: string }[] = [];

  private authSub = new Subscription();
  private routerSub = new Subscription();

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {
    // Detect navigation changes to toggle transparency logic
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isHomePage =
          event.urlAfterRedirects === '/' || event.urlAfterRedirects === '';
      });
  }

  ngOnInit() {
    this.updateLinks();
    this.authSub = this.authService.isAuthenticated$.subscribe(() => {
      this.updateLinks();
    });
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
    this.routerSub.unsubscribe();
  }

  // Determine background state
  get useTransparentBg(): boolean {
    return this.isHomePage && !this.isScrolled && !this.isMobileMenuOpen;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 40;
  }

  updateLinks() {
    const role = (this.authService.getRole() || '').trim().toLowerCase();

    if (role === 'coordinator') {
      this.navLinks = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Manage Services', path: '/dashboard/services' },
        { label: 'All Bookings', path: '/dashboard/bookings' },
        { label: 'Enquiries', path: '/dashboard/enquiries' },
        { label: 'Workers', path: '/dashboard/support-workers' },
      ];
    } else if (role === 'participant') {
      this.navLinks = [
        { label: 'About Us', path: '/about' },
        { label: 'Services', path: '/services' },
        { label: 'Admission', path: '/admission' },
        { label: 'My Bookings', path: '/bookings' },
      ];
    } else {
      this.navLinks = [
        { label: 'About Us', path: '/about' },
        { label: 'Services', path: '/explore/services' },
        { label: 'Admission', path: '/admission' },
        { label: 'Contact Us', path: '/contact' },
      ];
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}