import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-view',
  standalone: true,
  template: `
    <svg
      width="14"
      height="11"
      viewBox="0 0 14 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.75 5.25C0.75 5.25 2.55 0.75 6.75 0.75C10.95 0.75 12.75 5.25 12.75 5.25C12.75 5.25 10.95 9.75 6.75 9.75C2.55 9.75 0.75 5.25 0.75 5.25Z"
        stroke="#444444"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.75 7.17857C7.74411 7.17857 8.55 6.31512 8.55 5.25C8.55 4.18488 7.74411 3.32143 6.75 3.32143C5.75589 3.32143 4.95 4.18488 4.95 5.25C4.95 6.31512 5.75589 7.17857 6.75 7.17857Z"
        stroke="#444444"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
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
export class ViewIconComponent {
  @Input() size: number = 20;
}