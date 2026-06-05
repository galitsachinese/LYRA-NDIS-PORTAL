import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message-icon',
  standalone: true,
  template: `
    <svg
      width="25"
      height="20"
      viewBox="0 0 25 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.5 11.25L0 3.45V2.5C0 1.1125 1.1125 0 2.5 0H22.5C23.163 0 23.7989 0.263392 24.2678 0.732233C24.7366 1.20107 25 1.83696 25 2.5V3.4375L12.5 11.25ZM25 17.5C25 18.163 24.7366 18.7989 24.2678 19.2678C23.7989 19.7366 23.163 20 22.5 20H2.5C1.1125 20 0 18.875 0 17.5V6.3875L2.5 7.95V17.5H22.5V7.95L25 6.3875V17.5Z"
        fill="#6F2C91"
      />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: middle; /* Helps if placed next to text */
      }
      svg {
        display: block; /* Prevents the "descender" gap at the bottom */
      }
    `,
  ],
})
export class MessageIconComponent {
  @Input() size: number = 20;
}