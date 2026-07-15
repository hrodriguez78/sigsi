import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner" [ngClass]="size">
      <div class="spinner__circle"></div>
      <span *ngIf="message" class="spinner__message">{{ message }}</span>
    </div>
  `,
  styles: [
    `
      .spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 24px;
      }
      .spinner__circle {
        border: 3px solid #e2e8f0;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      .sm .spinner__circle {
        width: 20px;
        height: 20px;
        border-width: 2px;
      }
      .md .spinner__circle {
        width: 32px;
        height: 32px;
      }
      .lg .spinner__circle {
        width: 48px;
        height: 48px;
        border-width: 4px;
      }
      .spinner__message {
        font-size: 0.875rem;
        color: #64748b;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() message = '';
}
