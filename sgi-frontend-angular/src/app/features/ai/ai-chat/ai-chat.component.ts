import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectChatMessages, selectAILoading } from '../../../store/ai/ai.selectors';
import * as AIActions from '../../../store/ai/ai.actions';

@Component({
  selector: 'app-ai-chat',
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <span class="material-icons">smart_toy</span>
        <h3>Asistente ISO</h3>
      </div>

      <div class="chat-messages" #chatBox>
        <div class="message" *ngFor="let msg of messages$ | async"
             [class.user]="msg.role === 'user'"
             [class.assistant]="msg.role === 'assistant'">
          <span class="msg-avatar material-icons">{{ msg.role === 'user' ? 'person' : 'smart_toy' }}</span>
          <div class="msg-content" [innerHTML]="msg.content | markdown"></div>
        </div>
        <div class="typing" *ngIf="loading$ | async">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div class="chat-input">
        <input type="text" [(ngModel)]="message" placeholder="Pregunta sobre ISO 27001..."
               (keyup.enter)="send()" [disabled]="!!(loading$ | async)">
        <button (click)="send()" [disabled]="!message || !!(loading$ | async)">
          <span class="material-icons">send</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chat-container { display: flex; flex-direction: column; height: 500px; background: var(--card-bg); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-sm); }
    .chat-header { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; background: var(--primary-color); color: #fff; }
    .chat-header h3 { margin: 0; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .message { display: flex; gap: 0.5rem; align-items: flex-start; }
    .message.user { flex-direction: row-reverse; }
    .msg-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem; background: var(--bg-tertiary); color: var(--text-secondary); }
    .message.user .msg-avatar { background: var(--primary-color); color: #fff; }
    .msg-content { max-width: 80%; padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.875rem; line-height: 1.5; }
    .message.assistant .msg-content { background: var(--bg-tertiary); color: var(--text-primary); }
    .message.user .msg-content { background: var(--primary-color); color: #fff; }
    .typing { display: flex; gap: 4px; padding: 0.5rem; }
    .typing span { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); animation: bounce 1.4s infinite; }
    .typing span:nth-child(2) { animation-delay: 0.2s; }
    .typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    .chat-input { display: flex; gap: 0.5rem; padding: 0.75rem; border-top: 1px solid var(--border-color); }
    .chat-input input { flex: 1; padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.875rem; }
    .chat-input input:focus { outline: none; border-color: var(--primary-color); }
    .chat-input button { background: var(--primary-color); color: #fff; border: none; border-radius: 8px; padding: 0.5rem; cursor: pointer; }
    .chat-input button:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AIChatComponent implements OnInit {
  @ViewChild('chatBox') chatBox!: ElementRef;

  messages$!: Observable<{ role: string; content: string }[]>;
  loading$!: Observable<boolean>;
  message = '';
  private sessionId: string | null = null;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.messages$ = this.store.select(selectChatMessages);
    this.loading$ = this.store.select(selectAILoading);
  }

  send(): void {
    if (!this.message.trim()) return;
    this.store.dispatch(AIActions.sendChatMessage({
      message: this.message,
      sessionId: this.sessionId || undefined,
    }));
    this.message = '';
    setTimeout(() => {
      const el = this.chatBox?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }
}
