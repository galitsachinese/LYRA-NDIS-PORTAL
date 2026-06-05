import { Component, Input } from '@angular/core'; 
import { CommonModule } from '@angular/common';

interface FAQItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faq-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-section.component.html',
})
export class FaqSectionComponent {
  faqs: FAQItem[] = [
    {
      question: 'How long does the admission process take?',
      answer:
        'Our standard admission process typically takes 2-5 business days depending on documentation availability.',
      open: false,
    },
    {
      question: 'Do I need to have my NDIS plan approved first?',
      answer:
        'Yes, having an active or approved NDIS plan helps us map services faster, but we can guide you through pre-planning stages.',
      open: false,
    },
    {
      question: 'Can a family member or carer attend the consultation?',
      answer:
        'Absolutely. We encourage support networks to participate in all care strategy consultations.',
      open: false,
    },
    {
      question: 'What if I want to change services later?',
      answer:
        'Your service arrangements are completely flexible. You can scale modifications through your coordinator at any time.',
      open: false,
    },
    {
      question: 'Is there a cost to me?',
      answer:
        'Most services are fully covered under your NDIS funding package allocations. We clarify all costs transparently upfront.',
      open: false,
    },
  ];

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
