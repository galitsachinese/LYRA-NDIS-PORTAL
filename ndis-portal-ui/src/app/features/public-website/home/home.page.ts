import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlideshowComponent } from '../../../../shared/components/slideshow/slideshow.component';
import { NavbarComponent } from '../../../../shared/components/navbar-website/navbar.component';

import { ContactSectionComponent } from '../../../../shared/components/contact-section/contact-section.component';
import { FaqSectionComponent } from '../../../../shared/components/faq-section/faq-section.component'; 
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { ServiceCardComponent } from '../../../../shared/components/card/service-card/service-card.component';


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    SlideshowComponent,
    NavbarComponent,
    ContactSectionComponent,
    FaqSectionComponent,
    FooterComponent,
    ServiceCardComponent,
  ],
  templateUrl: './home.page.html',
})
export class HomePageComponent {
  homeImages: string[] = [
    // slideshow images
    'assets/imagesSlideshow/1.jpg',
    'assets/imagesSlideshow/2.jpg',

    // home page images
    'assets/imagesSlideshow/3.jpg',
    'assets/imagesSlideshow/4.jpg',
  ];

  hero = [
    {
      title: 'Empowering Independence, Dignity, and Choice',
      desc: 'At [Organization Name], we are dedicated to empowering people living with disability to live their lives with greater independence, dignity, and choice.',
    },
  ];

  about = [
    {
      title: 'Your Goals Your Life Our Support',
      desc: '[Organization Name] is a registered NDIS service provider dedicated to empowering people living with disability to live their lives with greater independence, dignity, and choice.',
    },
  ];

  services = [
    {
      title: 'Our Trusted Services',
      desc: 'We offer a comprehensive range of NDIS services tailored to meet the unique needs and goals of each participant.',
    },
    { buttonLabel: 'Explore Services' },
    {
      cardTitle: 'Personal Hygiene Assistance',
      cardDesc:
        'Temporary or long-term personal assistance support customized to individual lifestyle choices.',
    },
    {
      cardTitle: 'Domestic Assistance',
      cardDesc:
        'Household tasks including clean-up, laundry, grocery shopping and meal preparation.',
    },
  ];

  // Add this inside your HomePage component class
  ctaBanner = {
    title: 'Get started with our services',
    desc: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. AeneanLorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean',
    buttonLabel: 'Get Started',
  };
}