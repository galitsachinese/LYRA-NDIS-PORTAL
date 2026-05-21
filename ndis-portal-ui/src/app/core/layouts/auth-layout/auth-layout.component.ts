import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="auth-shell">
      <!-- Top header bar on auth pages -->
      <header class="auth-header">
        <div class="auth-header-inner">
          <div class="auth-logo">
            <div class="auth-logo-icon">
              <img src="/assets/logondis.png" alt="NDIS Logo" class="h-full w-full object-contain p-1" />
            </div>
            <span class="auth-logo-text">NDIS Portal</span>
          </div>
          <div class="auth-tagline">National Disability Insurance Scheme</div>
        </div>
      </header>
      <div class="auth-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-shell {
        width: 100vw;
        height: 100vh;
        overflow: auto;
        display: flex;
        flex-direction: column;
        background: #f8fafc;
      }

      .auth-header {
        flex-shrink: 0;
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%);
        box-shadow: 0 4px 20px rgba(91, 33, 182, 0.25);
        padding: 0 24px;
      }

      .auth-header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 56px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .auth-logo {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .auth-logo-icon {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .auth-logo-text {
        font-size: 1.125rem;
        font-weight: 700;
        color: white;
        letter-spacing: -0.02em;
      }

      .auth-tagline {
        font-size: 0.75rem;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.7);
        letter-spacing: 0.02em;
      }

      .auth-content {
        flex: 1;
        display: flex;
        align-items: stretch;
      }

      @media (max-width: 768px) {
        .auth-header {
          padding: 0 16px;
        }

        .auth-header-inner {
          height: 48px;
        }

        .auth-logo-text {
          font-size: 1rem;
        }

        .auth-tagline {
          display: none;
        }
      }
    `,
  ],
})
export class AuthLayoutComponent {}
