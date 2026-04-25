import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken(),
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Update on initialization if in browser
    if (isPlatformBrowser(this.platformId)) {
      this.isAuthenticatedSubject.next(this.hasToken());
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private hasToken(): boolean {
    if (!this.isBrowser()) {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  login(token: string, userId: string, email: string): void {
    if (!this.isBrowser()) return;

    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('email', email);
    this.isAuthenticatedSubject.next(true);
  }

  logout(): void {
    if (!this.isBrowser()) return;

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem('token');
  }

  getUserId(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem('userId');
  }

  getEmail(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem('email');
  }
}
