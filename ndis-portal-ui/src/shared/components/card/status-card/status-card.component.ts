import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-card-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-card.component.html',
})
export class StatusCardComponent {
  @Input({ required: true }) label = '';
  @Input({ required: true }) value = 0;

  // Appearance
  @Input() accentColor = '#6B3293';
  @Input() valueColor = '#111827';
  @Input() iconBackground = '#F3E8FF';
  @Input() iconColor = '#6B3293';

  // SVG
  @Input() iconPath = '';
}
