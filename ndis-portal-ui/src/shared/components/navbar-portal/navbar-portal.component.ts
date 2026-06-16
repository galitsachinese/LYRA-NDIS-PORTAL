import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  // Input: List of links to display in the center
  @Input() navLinks: { label: string; path: string }[] = [];

  // Input: If true, forces the navbar to be solid purple immediately
  @Input() isSolid: boolean = false;

  // State management
  public isScrolled = false;
  public isMobileMenuOpen = false;

  /**
   * Listen to scroll to trigger background change
   * (Only effective if isSolid is false)
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.isSolid) {
      this.isScrolled = window.scrollY > 40;
    }
  }

  /**
   * Toggle mobile menu state
   */
  public toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
