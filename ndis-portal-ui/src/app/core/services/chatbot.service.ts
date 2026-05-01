import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

import { ChatMessage } from '../models/chat-message.model';

interface ChatApiResponse {
  reply?: string;
  Data?: {
    reply?: string;
  };
  Message?: {
    reply?: string;
  };
}

interface ChatRequest {
  message: string;
  conversationHistory: { role: string; content: string }[];
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private storageKey = 'chat_history';
  private apiUrl = `${environment.apiUrl}/chat`;
  private minimumTypingMs = 500;

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  
  private loadingSubject = new BehaviorSubject<boolean>(false);

  messages$ = this.messagesSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private auth: AuthService
  ) {
    this.messagesSubject.next(this.loadMessages());
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Check if current user is participant
   */
  private isParticipant(): boolean {
    const role = this.auth.getRole();
    return role?.toLowerCase() === 'participant';
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Send user message to API
   */
  sendMessage(text: string) {
    console.log('[ChatService] sendMessage called:', text);
    
    // Block non-participants
    if (!this.isParticipant()) {
      console.log('[ChatService] Access denied - only participants can use chat');
      return;
    }
    
    if (!text.trim() || this.isLoading()) {
      console.log('[ChatService] Empty message, returning');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...this.messagesSubject.value, userMessage];
    console.log('[ChatService] Adding user message, total messages:', updatedMessages.length);
    this.messagesSubject.next(updatedMessages);
    this.saveMessages(updatedMessages);

    // Call backend API
    console.log('[ChatService] Calling API...');
    this.callChatApi(text, updatedMessages);
  }

  /**
   * Call backend chat API
   */
  private callChatApi(message: string, currentMessages: ChatMessage[]) {
    const typingStartedAt = Date.now();
    this.loadingSubject.next(true);
    console.log('[ChatService] callChatApi - API URL:', this.apiUrl);

    // Prepare conversation history (last 10 messages for context)
    const conversationHistory = currentMessages
      .slice(-11, -1) // Exclude the last user message we just added
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    const request: ChatRequest = {
      message: message.trim(),
      conversationHistory
    };

    this.http.post<any>(this.apiUrl, request)
      .pipe(
        catchError(error => {
          console.error('[ChatService] API error:', error);
          console.error('[ChatService] Error status:', error.status);
          console.error('[ChatService] Error message:', error.message);
          return of({
            reply: 'Sorry, I am temporarily unavailable. Please try again later or contact your Support Coordinator for assistance.',
          });
        })
      )
      .subscribe(response => {
        const elapsed = Date.now() - typingStartedAt;
        const remainingDelay = Math.max(this.minimumTypingMs - elapsed, 0);

        setTimeout(() => {
          console.log('[ChatService] API response received:', response);
          console.log('[ChatService] Response structure:', JSON.stringify(response, null, 2));
          
          // Handle wrapped response format
          const reply = response.Data?.reply || response.reply || response.Message?.reply;
          
          console.log('[ChatService] Extracted reply:', reply);
          
          if (reply) {
            console.log('[ChatService] Got reply, adding bot message');
            const botMessage: ChatMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              content: reply,
              timestamp: new Date(),
            };

            const updatedMessages = [...this.messagesSubject.value, botMessage];
            console.log('[ChatService] Total messages after adding bot:', updatedMessages.length);
            this.messagesSubject.next(updatedMessages);
            this.saveMessages(updatedMessages);
          } else {
            console.log('[ChatService] Empty reply from API - response keys:', Object.keys(response));
          }

          this.loadingSubject.next(false);
        }, remainingDelay);
      });
  }

  /**
   * Save to localStorage
   */
  private saveMessages(messages: ChatMessage[]) {
    if (!this.isBrowser()) return;

    localStorage.setItem(this.storageKey, JSON.stringify(messages));
  }

  /**
   * Load stored messages
   */
  private loadMessages(): ChatMessage[] {
    if (!this.isBrowser()) return [];

    const data = localStorage.getItem(this.storageKey);

    try {
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear chat history - called when user logs in
   */
  clearHistory(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.storageKey);
    }

    this.messagesSubject.next([]);
    console.log('[ChatService] Chat history cleared');
  }
}
