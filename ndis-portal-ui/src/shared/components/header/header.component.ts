import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../app/core/services/auth.service';
import { SidebarService } from '../../../app/core/services/sidebar.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header-bar">
      <div class="header-inner">
        <!-- Left: Hamburger + Logo -->
        <div class="flex items-center gap-3">
          <!-- Hamburger (mobile only) -->
          <button
            (click)="toggleSidebar()"
            class="hamburger-btn"
            aria-label="Toggle sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <!-- Logo -->
          <a routerLink="/" class="logo-link">
            <div class="logo-wrapper">
              <img
                src="/assets/logondis.png"
                alt="NDIS Logo"
                class="logo-img"
              />
            </div>
            <span class="logo-text">NDIS Portal</span>
          </a>
        </div>

        <!-- Right: User info + Logout -->
        <div class="flex items-center gap-4">
          <!-- User Badge -->
          <div class="user-badge">
            <span class="user-avatar">{{ getInitials() }}</span>
            <div class="user-info">
              <span class="user-name">{{ userName }}</span>
              <span class="user-role">{{ userRoleLabel }}</span>
            </div>
          </div>

          <!-- Logout -->
          <button (click)="logout()" class="logout-btn" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span class="logout-label">Logout</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .header-bar {
        position: sticky;
        top: 0;
        z-index: 50;
        width: 100%;
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%);
        box-shadow: 0 4px 20px rgba(91, 33, 182, 0.25);
      }

      .header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 64px;
        padding: 0 20px;
        max-width: 100%;
        margin: 0 auto;
      }

      /* Hamburger */
      .hamburger-btn {
        display: none;
        padding: 8px;
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.1);
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .hamburger-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      /* Logo */
      .logo-link {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        cursor: pointer;
      }

      .logo-wrapper {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .logo-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .logo-text {
        font-size: 1.25rem;
        font-weight: 700;
        color: white;
        letter-spacing: -0.02em;
        white-space: nowrap;
      }

      /* User Badge */
      .user-badge {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 12px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(4px);
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: linear-gradient(135deg, #fbbf24, #f59e0b);
        color: #78350f;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        flex-shrink: 0;
      }

      .user-info {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
      }

      .user-name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: white;
      }

      .user-role {
        font-size: 0.6875rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
        text-transform: capitalize;
      }

      /* Logout */
      .logout-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.85);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.15);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
        font-size: 0.8125rem;
        font-weight: 500;
      }

      .logout-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border-color: rgba(255, 255, 255, 0.3);
      }

      .logout-label {
        display: inline;
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .hamburger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-inner {
          height: 56px;
          padding: 0 12px;
        }

        .logo-wrapper {
          width: 34px;
          height: 34px;
          padding: 4px;
        }

        .logo-text {
          font-size: 1.0625rem;
        }

        .user-info {
          display: none;
        }

        .user-badge {
          padding: 4px 8px;
          background: transparent;
        }

        .user-avatar {
          width: 30px;
          height: 30px;
          font-size: 0.6875rem;
        }

        .logout-btn {
          padding: 6px 10px;
        }

        .logout-label {
          display: none;
        }
      }

      @media (max-width: 480px) {
        .logo-text {
          font-size: 0.9375rem;
        }

        .header-inner {
          padding: 0 8px;
          gap: 4px;
        }

        .logout-btn {
          padding: 6px 8px;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  userName: string = '';
  userRole: string = '';

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private router: Router
  ) {
    this.loadUser();
  }

  private loadUser(): void {
    const email = this.authService.getEmail();
    this.userName = email || 'User';
    this.userRole = this.authService.getRole() || 'participant';
  }

  get userRoleLabel(): string {
    return this.userRole === 'coordinator' ? 'Coordinator' : 'Participant';
  }

  getInitials(): string {
    if (!this.userName || this.userName === 'User') return 'U';
    const parts = this.userName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}