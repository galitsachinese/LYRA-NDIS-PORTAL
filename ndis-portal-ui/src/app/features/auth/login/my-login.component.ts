import { Component, HostBinding } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SlideshowComponent } from '../../../../shared/components/slideshow/slideshow.component';
import { InputComponent } from '../../../../shared/components/input/input.component';


@Component({
  selector: 'app-my-login',
  standalone: true,
  imports: [FormsModule, CommonModule, SlideshowComponent, InputComponent],
  templateUrl: './my-login.component.html',
  styleUrls: ['./my-login.component.css'],
})
export class MyLoginComponent {
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.height') hostHeight = '100%';

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  // Slideshow images - reusable for login and signup
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

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // 1. Use an ARROW FUNCTION () => {} to keep 'this' context
    setTimeout(() => {
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockUserId = '123';

      // 2. Use '!' if the compiler is still worried about nullability
      this.authService!.login(mockToken, mockUserId, this.email);
      this.isLoading = false;

      this.router!.navigate(['/bookings']);
    }, 500);
  }
}