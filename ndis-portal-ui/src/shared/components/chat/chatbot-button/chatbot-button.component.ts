import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chatbot-button.component.html',
})
export class ChatButtonComponent {
  /**
   * Custom click event
   */
  @Output()
  buttonClick = new EventEmitter<void>();

  /**
   * Trigger event
   */
  handleClick() {
    this.buttonClick.emit();
  }
}
