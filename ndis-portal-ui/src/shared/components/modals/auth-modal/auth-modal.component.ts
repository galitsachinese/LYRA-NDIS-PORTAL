import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SlideshowComponent } from '../../slideshow/slideshow.component';
import {
  AuthService,
  LoginRequest,
  RegisterRequest,
} from '../../../../app/core/services/auth.service';
import { TermsModalComponent } from '../../terms-modal/terms-modal.component';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, SlideshowComponent, TermsModalComponent],
  templateUrl: './auth-modal.component.html',
  styles: [],
})
export class AuthModalComponent {
  @Input() serviceId: number | string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

  @ViewChild(TermsModalComponent) termsModal!: TermsModalComponent;

  private apiUrl = environment.apiUrl;

  // Tab state
  activeTab: 'login' | 'signup' = 'login';

  // Slideshow images (reuse from login page, but smaller)
  slideImages = [
    'assets/imagesSlideshow/2.jpg',
    'assets/imagesSlideshow/3.jpg',
    'assets/imagesSlideshow/4.jpg',
    'assets/imagesSlideshow/5.jpg',
    'assets/imagesSlideshow/6.jpg',
    'assets/imagesSlideshow/7.jpg',
    'assets/imagesSlideshow/8.jpg',
    'assets/imagesSlideshow/9.jpg',
    'assets/imagesSlideshow/10.jpg',
    'assets/imagesSlideshow/11.jpg',
    'assets/imagesSlideshow/12.jpg',
    'assets/imagesSlideshow/13.jpg',
    'assets/imagesSlideshow/14.jpg',
    'assets/imagesSlideshow/15.jpg',
    'assets/imagesSlideshow/16.jpg',
    'assets/imagesSlideshow/17.jpg',
    'assets/imagesSlideshow/18.jpg',
  ];

  // Login form
  loginEmail = '';
  loginPassword = '';
  loginError = '';
  loginLoading = false;

  // Signup form
  signupData = {
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  };
  signupError = '';
  signupSuccess = '';
  signupLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  setActiveTab(tab: 'login' | 'signup') {
    this.activeTab = tab;
    this.loginError = '';
    this.signupError = '';
    this.signupSuccess = '';
  }

  closeModal() {
    this.close.emit();
  }

  private afterLoginSuccess() {
    this.loginSuccess.emit();
    this.closeModal();

    if (this.serviceId) {
      this.router.navigate(['/participant/book-service'], {
        queryParams: { serviceId: this.serviceId },
      });
    } else {
      const role = this.authService.getRole();
      const redirectPath = role?.toLowerCase() === 'coordinator' ? '/dashboard' : '/services';
      this.router.navigate([redirectPath]);
    }
  }

  // ============================
  // LOGIN
  // ============================
  onLogin() {
    this.loginError = '';

    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Email and password are required';
      return;
    }

    const trimmedEmail = this.loginEmail.trim();
    if (trimmedEmail.length > 50) {
      this.loginError = 'Email must be 50 characters or less';
      return;
    }
    if (!trimmedEmail.includes('@')) {
      this.loginError = 'Email must contain @ symbol';
      return;
    }
    if (!trimmedEmail.toLowerCase().endsWith('.com')) {
      this.loginError = 'Email must end with .com';
      return;
    }
    const parts = trimmedEmail.split('@');
    if (parts.length !== 2) {
      this.loginError = 'Email must contain exactly one @ symbol';
      return;
    }
    if (parts[1].toLowerCase() !== parts[1]) {
      this.loginError = 'Domain part of email must be lowercase';
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.com$/;
    if (!emailRegex.test(trimmedEmail)) {
      this.loginError = 'Please enter a valid email address (e.g., user@domain.com)';
      return;
    }
    if (this.loginPassword.length < 8) {
      this.loginError = 'Password must be at least 8 characters';
      return;
    }

    this.loginLoading = true;
    const loginData: LoginRequest = {
      email: this.loginEmail,
      password: this.loginPassword,
    };

    this.authService.loginApi(loginData).subscribe({
      next: (response: any) => {
        this.loginLoading = false;
        const data = response.Data || response;
        const status = data?.status || (response.Success ? 200 : 400);
        const token = data?.token;
        const user = data?.user;
        const message = data?.message || response.Message;

        if (status === 200 && token) {
          const userId = user?.id?.toString() || '';
          const role = user?.role || '';
          this.authService.login(token, userId, trimmedEmail, role);
          this.afterLoginSuccess();
        } else {
          this.loginError = message || 'Login failed. Please try again.';
        }
      },
      error: (error: any) => {
        this.loginLoading = false;
        this.loginError = this.getLoginErrorMessage(error);
      },
    });
  }

  private getLoginErrorMessage(error: any): string {
    if (error.status) {
      const apiMessage = error.error?.message || error.error?.Message || error.error?.error;
      switch (error.status) {
        case 400: return apiMessage || 'Invalid email or password format.';
        case 401: return 'Incorrect email or password. Please verify your credentials.';
        case 404: return apiMessage || 'User account not found.';
        case 500: return apiMessage || 'Server error. Please try again later.';
        case 0: return 'Network error. Please check your connection.';
        default: return apiMessage || 'Login failed. Please try again.';
      }
    }
    return error.message || 'Invalid email or password.';
  }

  // ============================
  // SIGNUP
  // ============================
  openTermsModal() {
    this.termsModal.openModal();
  }

  onSignUp() {
    this.signupError = '';
    this.signupSuccess = '';

    if (!this.signupData.agreeToTerms) {
      this.signupError = 'You must agree to the terms.';
      return;
    }
    if (!this.signupData.firstName || !this.signupData.lastName) {
      this.signupError = 'First name and last name are required.';
      return;
    }
    const trimmedEmail = this.signupData.email.trim();
    if (!trimmedEmail) { this.signupError = 'Email is required.'; return; }
    if (trimmedEmail.length > 50) { this.signupError = 'Email must be 50 characters or less'; return; }
    if (!trimmedEmail.includes('@')) { this.signupError = 'Email must contain @ symbol'; return; }
    if (!trimmedEmail.toLowerCase().endsWith('.com')) { this.signupError = 'Email must end with .com'; return; }
    const emailParts = trimmedEmail.split('@');
    if (emailParts.length !== 2) { this.signupError = 'Email must contain exactly one @ symbol'; return; }
    if (emailParts[1].toLowerCase() !== emailParts[1]) { this.signupError = 'Domain part of email must be lowercase'; return; }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.com$/;
    if (!emailRegex.test(trimmedEmail)) { this.signupError = 'Please enter a valid email address (e.g., user@domain.com)'; return; }

    if (!this.signupData.password || this.signupData.password.length < 8) {
      this.signupError = 'Password must be at least 8 characters.';
      return;
    }
    if (!this.signupData.confirmPassword || this.signupData.confirmPassword !== this.signupData.password) {
      this.signupError = 'Passwords do not match.';
      return;
    }
    if (!this.signupData.role) {
      this.signupError = 'Please select a role.';
      return;
    }

    this.signupLoading = true;

    const registerData: RegisterRequest = {
      fullName: `${this.signupData.firstName} ${this.signupData.lastName}`,
      email: trimmedEmail,
      password: this.signupData.password,
      role: this.signupData.role.charAt(0).toUpperCase() + this.signupData.role.slice(1),
    };

    const loginData: LoginRequest = {
      email: trimmedEmail,
      password: this.signupData.password,
    };

    this.authService.register(registerData).pipe(
      switchMap(() => this.authService.loginApi(loginData)),
    ).subscribe({
      next: (response: any) => {
        this.signupLoading = false;
        const data = response.Data || response;
        const status = data?.status || (response.Success ? 200 : 400);
        const token = data?.token;
        const user = data?.user;

        if (status === 200 && token) {
          const userId = user?.id?.toString() || '';
          const role = user?.role || registerData.role;
          this.authService.login(token, userId, trimmedEmail, role);
          this.afterLoginSuccess();
        } else {
          this.signupError = 'Account created, but automatic login failed. Please log in manually.';
          this.activeTab = 'login';
        }
      },
      error: (error: any) => {
        this.signupLoading = false;
        this.signupError = this.signupSuccess
          ? 'Account created, but automatic login failed. Please log in manually.'
          : this.getSignupErrorMessage(error);
      },
    });
  }

  private getSignupErrorMessage(error: any): string {
    if (error.status) {
      const apiMessage = error.error?.message || error.error?.Message || error.error?.error;
      switch (error.status) {
        case 400: return apiMessage || 'Invalid input. Please check all fields.';
        case 409: return apiMessage || 'Email is already registered. Please log in.';
        case 422: return apiMessage || 'Validation error.';
        case 500: return apiMessage || 'Server error. Please try again later.';
        case 0: return 'Network error. Please check your connection.';
        default: return apiMessage || 'Registration failed. Please try again.';
      }
    }
    return error.message || 'Registration failed. Please try again.';
  }
}