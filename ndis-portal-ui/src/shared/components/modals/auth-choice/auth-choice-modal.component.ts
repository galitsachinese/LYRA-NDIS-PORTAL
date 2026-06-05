import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-choice-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal Backdrop -->
    <div
      *ngIf="isVisible"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity"
    >
      <!-- Modal Card -->
      <div
        class="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in duration-300"
      >
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold text-slate-900">Sign in to book</h2>
          <p class="text-slate-500 text-sm">
            Please login or register to proceed with your support booking.
          </p>
        </div>

        <div class="flex flex-col gap-3">
          <!-- Login Action -->
          <button
            (click)="handleAction('/login')"
            class="w-full bg-[#6F2C91] text-white py-3 rounded-xl font-semibold hover:bg-[#5a2375] transition-all"
          >
            Login
          </button>

          <!-- Register Action -->
          <button
            (click)="handleAction('/register')"
            class="w-full border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all"
          >
            Register Account
          </button>
        </div>

        <!-- Dismiss Button -->
        <button
          (click)="closeModal()"
          class="w-full text-slate-400 text-xs hover:text-slate-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  `,
})
export class AuthChoiceModalComponent {
  isVisible = false;

  constructor(private router: Router) {}

  /**
   * Opens the modal state
   */
  openModal(): void {
    this.isVisible = true;
  }

  /**
   * Closes the modal state
   */
  closeModal(): void {
    this.isVisible = false;
  }

  /**
   * Routes user to the selected auth flow
   * @param path Target route (e.g., /login or /register)
   */
  handleAction(path: string): void {
    this.closeModal();
    this.router.navigate([path]);
  }
}
