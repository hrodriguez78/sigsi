import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WidgetConfig } from '../../../core/models';

@Component({
  selector: 'app-widget-settings',
  template: `
    <div class="widget-settings" *ngIf="visible">
      <div class="settings-header">
        <h3>Configurar Dashboard</h3>
        <button class="close-btn" (click)="onClose.emit()">
          <span class="material-icons">close</span>
        </button>
      </div>
      <div class="settings-body">
        <div class="columns-setting">
          <label>Columnas del grid</label>
          <div class="column-options">
            <button *ngFor="let opt of columnOptions"
                    [class.active]="columns === opt"
                    (click)="onColumnsChange.emit(opt)">
              {{ opt }}
            </button>
          </div>
        </div>
        <div class="widgets-list">
          <label>Widgets visibles</label>
          <div class="widget-toggle" *ngFor="let widget of widgets">
            <span class="material-icons widget-toggle-icon"
                  [style.color]="widget.color">{{ widget.icon || 'widgets' }}</span>
            <span class="widget-toggle-label">{{ widget.title }}</span>
            <label class="toggle-switch">
              <input type="checkbox" [checked]="widget.enabled"
                     (change)="onToggleWidget.emit(widget.id)">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="settings-footer">
        <button class="btn-secondary" (click)="onReset.emit()">
          <span class="material-icons">restart_alt</span> Restablecer
        </button>
      </div>
    </div>
  `,
  styles: [`
    .widget-settings {
      position: fixed;
      top: 0;
      right: 0;
      width: 320px;
      height: 100vh;
      background: var(--bg-primary);
      border-left: 1px solid var(--border-color);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      box-shadow: -4px 0 24px rgba(0,0,0,0.15);
    }
    .settings-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .settings-header h3 {
      margin: 0;
      font-size: 1rem;
      color: var(--text-primary);
    }
    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      padding: 0.25rem;
      border-radius: 4px;
      display: flex;
    }
    .close-btn:hover { background: var(--bg-hover); }
    .settings-body {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }
    .columns-setting {
      margin-bottom: 1.5rem;
    }
    .columns-setting label, .widgets-list label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .column-options {
      display: flex;
      gap: 0.5rem;
    }
    .column-options button {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-secondary);
      color: var(--text-primary);
      cursor: pointer;
      font-size: 0.875rem;
    }
    .column-options button.active {
      border-color: var(--primary-color);
      background: var(--primary-color);
      color: white;
    }
    .widget-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-color);
    }
    .widget-toggle:last-child { border-bottom: none; }
    .widget-toggle-icon { font-size: 1.125rem; }
    .widget-toggle-label {
      flex: 1;
      font-size: 0.875rem;
      color: var(--text-primary);
    }
    .toggle-switch {
      position: relative;
      width: 36px;
      height: 20px;
      cursor: pointer;
    }
    .toggle-switch input { display: none; }
    .toggle-slider {
      position: absolute;
      inset: 0;
      background: var(--bg-muted);
      border-radius: 20px;
      transition: 0.2s;
    }
    .toggle-slider::before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      top: 2px;
      left: 2px;
      transition: 0.2s;
    }
    .toggle-switch input:checked + .toggle-slider {
      background: var(--primary-color);
    }
    .toggle-switch input:checked + .toggle-slider::before {
      transform: translateX(16px);
    }
    .settings-footer {
      padding: 1rem;
      border-top: 1px solid var(--border-color);
    }
    .btn-secondary {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-secondary);
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      font-size: 0.875rem;
    }
    .btn-secondary:hover { background: var(--bg-hover); }
    .btn-secondary .material-icons { font-size: 1rem; }
  `]
})
export class WidgetSettingsComponent {
  @Input() visible = false;
  @Input() widgets: WidgetConfig[] = [];
  @Input() columns = 4;
  @Output() onClose = new EventEmitter<void>();
  @Output() onToggleWidget = new EventEmitter<string>();
  @Output() onColumnsChange = new EventEmitter<number>();
  @Output() onReset = new EventEmitter<void>();

  columnOptions = [2, 3, 4];
}
