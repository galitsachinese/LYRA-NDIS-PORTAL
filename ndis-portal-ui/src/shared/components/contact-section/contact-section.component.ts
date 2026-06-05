import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapIconComponent } from '../../components/icons/svg-icons/map-icon';
import { PhoneIconComponent } from '../../components/icons/svg-icons/phone-icon';
import { MessageIconComponent } from '../../components/icons/svg-icons/message-icon';
import { HourIconComponent } from '../../components/icons/svg-icons/hour-icon';
@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [CommonModule, MapIconComponent, PhoneIconComponent, MessageIconComponent, HourIconComponent],
  templateUrl: './contact-section.component.html',
})
export class ContactSectionComponent {
  contactInfo = [
    {
      type: 'map',
      value: 'Main Office Address Here',
      extra: '',
    },
    { type: 'phone', label: 'Call Us', value: '+61 1234 567 890', extra: '' },
    {
      type: 'email',
      label: 'Email Address',
      value: 'info@ndis.com',
      extra: '',
    },
    {
      type: 'clock',
      label: 'Business Hours',
      value: 'Mon - Fri: 8:00 AM - 5:00 PM',
      extra: 'Sat: 9:00 AM - 1:00 PM',
    },
  ];
}
