import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-map-icon',
  standalone: true,
  template: `
    <svg
      width="19"
      height="25"
      viewBox="0 0 19 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2.81424 2.64624C4.57182 0.883925 6.95423 0 9.5 0C12.0458 0 14.4282 0.883925 16.1858 2.64624C17.9565 4.42171 19 6.99679 19 10.168C19 12.6313 17.738 15.3274 16.3365 17.6119C14.9011 19.9515 13.1666 22.0987 11.9405 23.5144C10.6097 25.0508 8.39026 25.0508 7.05954 23.5144C5.83338 22.0987 4.09886 19.9515 2.66352 17.6119C1.26197 15.3274 0 12.6313 0 10.168C0 6.99679 1.04355 4.42171 2.81424 2.64624ZM7.125 8.97819C7.125 7.56147 8.18832 6.41299 9.5 6.41299C10.8117 6.41299 11.875 7.56147 11.875 8.97819C11.875 10.3949 10.8117 11.5434 9.5 11.5434C8.18832 11.5434 7.125 10.3949 7.125 8.97819ZM9.5 3.84779C6.87665 3.84779 4.75 6.14475 4.75 8.97819C4.75 11.8116 6.87665 14.1086 9.5 14.1086C12.1234 14.1086 14.25 11.8116 14.25 8.97819C14.25 6.14475 12.1234 3.84779 9.5 3.84779Z"
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
export class MapIconComponent {
  @Input() size: number = 20;
}