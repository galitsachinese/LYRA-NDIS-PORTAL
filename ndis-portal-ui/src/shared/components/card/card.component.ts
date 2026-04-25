import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardUi } from '../../../shared/ui/card/card.ui'; // Ensure this path is correct

@Component({
  selector: 'app-card-component',
  standalone: true,
  imports: [CommonModule, CardUi],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent {
  // We accept the filtered data from the page
  @Input() services: any[] = [];
}
