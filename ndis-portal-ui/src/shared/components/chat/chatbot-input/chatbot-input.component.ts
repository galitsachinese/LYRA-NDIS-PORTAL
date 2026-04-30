import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../app/core/services/chatbot.service';
import { SendIconComponent } from '../../icons/svg-icons/send-icon'
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, SendIconComponent],
  templateUrl: './chatbot-input.component.html',
})
export class ChatInputComponent {
  text = '';
  maxLength = 500;
  loading$: Observable<boolean>;

  constructor(private chat: ChatService) {
    this.loading$ = this.chat.loading$;
  }

  get remainingChars(): number {
    return this.maxLength - this.text.length;
  }

  send(event?: Event) {
    // Allow Shift+Enter to add new line, only send on Enter alone
    if (event instanceof KeyboardEvent && event.shiftKey) {
      return; // Let default behavior happen (new line)
    }

    if (event) {
      event.preventDefault();
    }

    if (this.chat.isLoading()) {
      return;
    }

    console.log('[ChatInput] Sending message:', this.text);
    if (this.text.trim() && this.text.length <= this.maxLength) {
      this.chat.sendMessage(this.text);
      this.text = '';
    }
  }
}
