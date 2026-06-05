import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  // Navigation states
  isScrolled = false;
  isMobileMenuOpen = false;
  isHomePage = true;

  constructor(private router: Router) {
    // 1. FORCE IMMEDIATE EVALUATION: Check current URL the instant the component is created
    // This prevents the navbar from being transparent on sub-pages before the first navigation event
    this.updateNavbarState(this.router.url);
  }

  ngOnInit(): void {
    // 2. LISTEN FOR NAVIGATION: Update state on every subsequent route change
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateNavbarState(event.urlAfterRedirects || event.url);
      });
  }

  /**
   * Centralized state manager
   */
  private updateNavbarState(url: string): void {
    this.isHomePage = url === '/' || url === '/home' || url.startsWith('/home');
    this.evaluateScrollState();
  }

  /**
   * Scroll listener with SSR safety
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.evaluateScrollState();
  }

  /**
   * Business rule coordinator
   * Forces solid state on non-home pages, otherwise follows scroll position
   */
  private evaluateScrollState(): void {
    if (!this.isHomePage) {
      // Sub-pages: Always solid colored background
      this.isScrolled = true;
    } else {
      // Home page: Dynamic transparency based on vertical scroll offset
      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      this.isScrolled = scrollY > 40;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
