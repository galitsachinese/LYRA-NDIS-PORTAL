import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqSectionComponent } from '../../../../shared/components/faq-section/faq-section.component';
interface TimelineStep {
  number: number;
  title: string;
  desc: string;
  ctaText?: string;
  ctaLink?: string;
  subText?: string;
  subTextLink?: string;
}

@Component({
  selector: 'app-admission-page',
  standalone: true,
  imports: [CommonModule, FaqSectionComponent],
  templateUrl: './admission.page.html',
})
export class AdmissionPageComponent {
  // Header Meta Strings
  pageTitle = 'How to get started with our Services';
  pageSubtitle =
    "We make the admission process as simple and supportive as possible. Here's what to expect.";

  // Structured timeline workflow matrix
  steps: TimelineStep[] = [
    {
      number: 1,
      title: 'Check Your Eligibility',
      desc: 'To access our services, you need to be an NDIS participant with an approved NDIS plan that includes funding for the type of support you are seeking. If you are unsure whether you are eligible, contact us and our team will help you understand your options.',
      subText: 'Learn more about NDIS eligibility at ndis.gov.au',
      subTextLink: 'https://ndis.gov.au',
    },
    {
      number: 2,
      title: 'Get in Touch',
      desc: 'Reach out to us via our Contact Us form, by phone, or by email. One of our support coordinators will respond within 2 business days to discuss your needs and how we can help.',
      ctaText: 'Contact Us',
      ctaLink: '/contact',
    },
    {
      number: 3,
      title: 'Initial Consultation',
      desc: 'We will arrange a free initial consultation — either in person, over the phone, or via video call — to understand your goals, preferences, and the supports outlined in your NDIS plan. There is no obligation at this stage.',
    },
    {
      number: 4,
      title: 'Service Agreement',
      desc: 'If you decide to proceed, we will prepare a Service Agreement that outlines the supports we will provide, the schedule, the costs, and your rights and responsibilities as a participant. You will have time to review this with a family member, carer, or advocate before signing.',
    },
    {
      number: 5,
      title: 'Meet Your Support Worker',
      desc: 'Once the Service Agreement is signed, we will match you with a support worker whose skills and experience align with your needs. You will have the opportunity to meet them before services begin.',
    },
    {
      number: 6,
      title: 'Services Begin',
      desc: 'Your support services commence on the agreed start date. Your coordinator will check in with you regularly to ensure the services are meeting your needs and to make any adjustments to your support plan.',
    },
  ];

  onCtaClick(step: TimelineStep): void {
    console.log(
      `Executing navigation or action routing for step: ${step.title}`,
    );
  }
}
