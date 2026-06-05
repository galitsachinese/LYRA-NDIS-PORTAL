import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Structural interface for alternating content sections
 */
interface ContentPillar {
  id: string;
  title: string;
  desc: string; // Preview text
  extendedDesc: string; // Hidden text
  buttonLabel: string;
  imageLeft: string;
  imageRight?: string;
  reverseLayout: boolean;
  isExpanded: boolean;
}

interface ValueCard {
  title: string;
  desc: string;
  spanClass: string;
}

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.page.html',
})
export class AboutPageComponent {
  // Matrix defining alternating content sections
  pillars: ContentPillar[] = [
    {
      id: 'who-we-are',
      title: 'Who We Are',
      desc: '[Organization Name] is a registered NDIS service provider dedicated to empowering people living with disability to live their lives with greater independence, dignity, and choice.',
      extendedDesc:
        'We have been supporting participants and their families across Australia since 2025, delivering personalized care plans and support services that put the individual at the centre of everything we do. As a registered NDIS provider, we operate within the NDIS Practice Standards and Quality Indicators — giving participants and their families confidence that the support they receive meets the highest standards of care.',
      buttonLabel: 'Read More',
      imageLeft: 'assets/imagesSlideshow/2.jpg',
      imageRight: 'assets/imagesSlideshow/2.jpg',
      reverseLayout: false,
      isExpanded: false,
    },
    {
      id: 'our-people',
      title: 'Our People',
      desc: 'Our people are at the heart of everything we do. Our teams are skilled, compassionate, and deeply committed to making a positive difference in the lives of those we support every day.',
      extendedDesc:
        'We believe exceptional care begins with exceptional people. By fostering a culture of inclusion and collaboration, we ensure our teams bring their best selves to work. We hire for heart as well as skill, seeking individuals who share our passion for connection. We celebrate diversity and recognize the unique strengths each person brings, knowing that supported staff deliver the highest quality care.',
      buttonLabel: 'Read More',
      imageLeft: 'assets/imagesSlideshow/2.jpg',
      reverseLayout: true,
      isExpanded: false,
    },
    {
      id: 'our-mission',
      title: 'Our Mission',
      desc: 'To provide compassionate, person-centred NDIS support services that enable participants to achieve their goals, build their capacity, and participate fully in their communities.',
      extendedDesc:
        'We dismantle accessibility blockades by configuring dependable frameworks focused entirely on individual goal attainment. This enables community members to assume full autonomy and master self-advocacy objectives seamlessly.',
      buttonLabel: 'Read More',
      imageLeft: 'assets/imagesSlideshow/3.jpg',
      reverseLayout: false,
      isExpanded: false,
    },
    {
      id: 'our-vision',
      title: 'Our Vision',
      desc: 'A community where every person living with disability has equal opportunity to live a fulfilling, independent, and connected life.',
      extendedDesc:
        'We envision a future free of societal friction points—where systemic barriers are completely transformed by progressive inclusivity metrics, and comprehensive accessibility defaults are seamlessly built directly into civic infrastructure.',
      buttonLabel: 'Read More',
      imageLeft: 'assets/imagesSlideshow/4.jpg',
      reverseLayout: true,
      isExpanded: false,
    },
  ];

  values: ValueCard[] = [
    {
      title: 'Respect',
      desc: 'We honor the dignity, rights, and choices of every participant.',
      spanClass: 'md:col-span-7',
    },
    {
      title: 'Compassion',
      desc: 'We care deeply about the wellbeing of those we support.',
      spanClass: 'md:col-span-5',
    },
    {
      title: 'Excellence',
      desc: 'We hold ourselves to the highest standards.',
      spanClass: 'md:col-span-4',
    },
    {
      title: 'Empowerment',
      desc: 'We build the capacity of every participant.',
      spanClass: 'md:col-span-4',
    },
    {
      title: 'Integrity',
      desc: 'Honesty and transparency guide our actions.',
      spanClass: 'md:col-span-4',
    },
  ];

  togglePillarExpansion(index: number): void {
    this.pillars[index].isExpanded = !this.pillars[index].isExpanded;
  }
}
