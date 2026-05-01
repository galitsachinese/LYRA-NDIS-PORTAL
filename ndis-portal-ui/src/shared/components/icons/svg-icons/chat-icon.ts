import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-chat',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.3333 16.0348C15.3333 16.0348 15.3975 15.9825 15.5 15.893C17.0358 14.5374 18 12.573 18 10.3859C18 6.30864 14.6417 3 10.5 3C6.35833 3 3 6.30864 3 10.3859C3 14.4651 6.35833 17.6596 10.5 17.6596C10.8533 17.6596 11.4333 17.633 12.24 17.5797C13.2917 18.3598 14.8267 19 16.17 19C16.5858 19 16.7817 18.61 16.515 18.2123C16.11 17.6453 15.5517 16.7368 15.335 16.0338L15.3333 16.0348Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.875 12.375C9.16667 14.6667 12.8333 14.6667 15.125 12.375"
        stroke="currentColor"
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
export class ChatIconComponent {
  @Input() size: number = 20;
}
