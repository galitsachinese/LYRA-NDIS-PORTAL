import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { MapIconComponent } from '../../components/icons/svg-icons/map-icon';
import { PhoneIconComponent } from '../../components/icons/svg-icons/phone-icon';
import { MessageIconComponent } from '../../components/icons/svg-icons/message-icon';
import { HourIconComponent } from '../../components/icons/svg-icons/hour-icon';

interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
}

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [CommonModule, FormsModule, MapIconComponent, PhoneIconComponent, MessageIconComponent, HourIconComponent],
  templateUrl: './contact-section.component.html',
})
export class ContactSectionComponent {
  private apiUrl = environment.apiUrl;

  contactInfo = [
    { type: 'map', value: 'Main Office Address Here', extra: '' },
    { type: 'phone', label: 'Call Us', value: '+61 1234 567 890', extra: '' },
    { type: 'email', label: 'Email Address', value: 'info@ndis.com', extra: '' },
    { type: 'clock', label: 'Business Hours', value: 'Mon - Fri: 8:00 AM - 5:00 PM', extra: 'Sat: 9:00 AM - 1:00 PM' },
  ];

  formData: ContactForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    message: '',
  };

  submitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  submitForm(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.submitting = true;

    this.http
      .post(`${this.apiUrl}/contact`, this.formData)
      .subscribe({
        next: () => {
          this.successMessage = 'Your enquiry has been submitted successfully. We will get back to you soon.';
          this.formData = { firstName: '', lastName: '', email: '', phoneNumber: '', message: '' };
          this.submitting = false;
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'An error occurred. Please try again later.';
          this.submitting = false;
        },
      });
  }
}
