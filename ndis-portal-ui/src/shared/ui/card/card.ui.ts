import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-ui',
  standalone: true,
  templateUrl: './card.ui.html',
  styleUrls: ['./card.ui.css'],
})
export class CardUi {
  // This class name is used in card.component.ts
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() tag: string = '';
}
