import { Component, Input, Output, EventEmitter } from '@angular/core';
import { WidgetConfig } from '../../../core/models';

@Component({
  selector: 'app-widget-wrapper',
  template: `
    <div class="widget-wrapper" [class.widget-hidden]="!widget.enabled"
         [class.widget-small]="widget.size === 'small'"
         [class.widget-medium]="widget.size === 'medium'"
         [class.widget-large]="widget.size === 'large'">
      <div class="widget-header">
        <div class="widget-title">
          <span class="material-icons widget-icon" *ngIf="widget.icon"
                [style.color]="widget.color">{{ widget.icon }}</span>
          <h3>{{ widget.title }}</h3>
        </div>
        <div class="widget-actions" *ngIf="editMode">
          <button class="widget-action-btn" (click)="onToggle.emit(widget.id)"
                  [title]="widget.enabled ? 'Ocultar' : 'Mostrar'">
            <span class="material-icons">{{ widget.enabled ? 'visibility' : 'visibility_off' }}</span>
          </button>
        </div>
      </div>
      <div class="widget-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .widget-wrapper {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .widget-hidden { opacity: 0.5; }
    .widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .widget-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .widget-icon { font-size: 1.25rem; }
    .widget-title h3 {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .widget-actions { display: flex; gap: 0.25rem; }
    .widget-action-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      color: var(--text-muted);
      display: flex;
    }
    .widget-action-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
    .widget-action-btn .material-icons { font-size: 1rem; }
    .widget-body {
      padding: 0.75rem 1rem;
      flex: 1;
      overflow: auto;
    }
  `]
})
export class WidgetWrapperComponent {
  @Input() widget!: WidgetConfig;
  @Input() editMode = false;
  @Output() onToggle = new EventEmitter<string>();
}
