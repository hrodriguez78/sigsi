import { Component } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { Toast } from '../../../core/models';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of (toastService.toasts$ | async)"
        class="toast"
        [ngClass]="'toast--' + toast.type"
      >
        <span class="material-icons toast__icon">
          {{ getIcon(toast.type) }}
        </span>
        <span class="toast__message">{{ toast.message }}</span>
        <button class="toast__close" (click)="toastService.dismiss(toast.id)">
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 2000;
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: 400px;
      }
      .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease;
        font-size: 0.875rem;
      }
      .toast--success {
        background: #dcfce7;
        color: #166534;
      }
      .toast--error {
        background: #fee2e2;
        color: #991b1b;
      }
      .toast--warning {
        background: #fef3c7;
        color: #92400e;
      }
      .toast--info {
        background: #dbeafe;
        color: #1e40af;
      }
      .toast__icon {
        font-size: 20px;
        flex-shrink: 0;
      }
      .toast__message {
        flex: 1;
      }
      .toast__close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        opacity: 0.6;
        color: inherit;
      }
      .toast__close:hover {
        opacity: 1;
      }
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}

  getIcon(type: Toast['type']): string {
    const icons: Record<string, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return icons[type] || 'info';
  }
}
