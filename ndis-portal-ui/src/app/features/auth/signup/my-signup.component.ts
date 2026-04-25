import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SlideshowComponent } from '../../../../shared/components/slideshow/slideshow.component';
import { InputComponent } from '../../../../shared/components/input/input.component';

@Component({
  selector: 'app-my-signup',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    SlideshowComponent,
    InputComponent
  ],
  templateUrl: './my-signup.component.html',
  styleUrls: ['./my-signup.component.css']
})
export class MySignupComponent {
  @HostBinding('style.display') display = 'block';
  @HostBinding('style.height') hostHeight = '100%';

  signupData = {
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    password: '',
    agreeToTerms: false
  };

  isLoading = false;
  errorMessage = '';

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

  onSignUp() {
    if (!this.signupData.agreeToTerms) {
      this.errorMessage = 'You must agree to the terms.';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('User signed up:', this.signupData);
    
    setTimeout(() => {
      this.isLoading = false;
      // Logical redirect would happen here
    }, 2000);
  }
}