import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-card-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-card.component.html',
  styleUrls: ['./status-card.component.css']
})
export class StatusCardComponent {
  @Input() label: string = '';
  @Input() value: number = 0;
  @Input() iconClass: string = '';
  @Input() iconColor: string = '';
  @Input() bgColor: string = '';
}
