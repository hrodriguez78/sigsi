import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OrgTreeNode } from '../../core/models';

@Component({
  selector: 'app-org-node',
  template: `
    <div class="org-node" [class.selected]="node.id === selectedId"
         [class.has-children]="node.children?.length"
         (click)="$event.stopPropagation(); onSelect.emit(node.id)">
      <div class="node-card">
        <div class="node-avatar">
          <span class="material-icons">person</span>
        </div>
        <div class="node-info">
          <span class="node-name">{{ node.name }}</span>
          <span class="node-holder" *ngIf="node.holder_name">{{ node.holder_name }}</span>
          <span class="node-dept" *ngIf="node.department">{{ node.department }}</span>
        </div>
        <div class="node-actions">
          <button class="node-action-btn" (click)="$event.stopPropagation(); onAddChild.emit(node.id)"
                  title="Agregar subordinado">
            <span class="material-icons">add</span>
          </button>
          <button class="node-action-btn danger" (click)="$event.stopPropagation(); onDelete.emit(node.id)"
                  title="Eliminar">
            <span class="material-icons">close</span>
          </button>
        </div>
      </div>
      <div class="children-container" *ngIf="node.children?.length">
        <div class="connector-line"></div>
        <div class="children-row">
          <app-org-node *ngFor="let child of node.children"
                        [node]="child"
                        [selectedId]="selectedId"
                        (onSelect)="onSelect.emit($event)"
                        (onAddChild)="onAddChild.emit($event)"
                        (onDelete)="onDelete.emit($event)">
          </app-org-node>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; align-items: center; }
    .org-node { display: flex; flex-direction: column; align-items: center; position: relative; }
    .node-card {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 0.875rem;
      background: var(--bg-primary);
      border: 2px solid var(--border-color);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s;
      min-width: 160px;
      position: relative;
      z-index: 2;
    }
    .node-card:hover { border-color: var(--primary-color); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .selected > .node-card { border-color: var(--primary-color); background: var(--primary-color)10; }
    .node-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: var(--bg-muted); display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .node-avatar .material-icons { font-size: 1.125rem; color: var(--text-muted); }
    .node-info { display: flex; flex-direction: column; min-width: 0; }
    .node-name { font-weight: 600; font-size: 0.8125rem; color: var(--text-primary); white-space: nowrap; }
    .node-holder { font-size: 0.75rem; color: var(--text-muted); }
    .node-dept { font-size: 0.6875rem; color: var(--primary-color); }
    .node-actions {
      display: flex; gap: 0.125rem; position: absolute; top: -8px; right: -8px;
      opacity: 0; transition: opacity 0.15s;
    }
    .node-card:hover .node-actions { opacity: 1; }
    .node-action-btn {
      width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--border-color);
      background: var(--bg-primary); cursor: pointer; display: flex; align-items: center;
      justify-content: center; padding: 0;
    }
    .node-action-btn .material-icons { font-size: 0.75rem; }
    .node-action-btn:hover { background: var(--primary-color); color: white; border-color: var(--primary-color); }
    .node-action-btn.danger:hover { background: var(--danger, #EF4444); border-color: var(--danger, #EF4444); }
    .children-container {
      display: flex; flex-direction: column; align-items: center; padding-top: 1.5rem;
      position: relative;
    }
    .connector-line {
      position: absolute; top: 0; width: 2px; height: 1.5rem;
      background: var(--border-color);
    }
    .children-row {
      display: flex; gap: 1rem; padding-top: 0.5rem;
      position: relative;
    }
    .children-row::before {
      content: ''; position: absolute; top: -0.75rem; left: 20%; right: 20%;
      height: 2px; background: var(--border-color);
    }
    :host-context(.children-row > :first-child) .children-row::before,
    :host-context(.children-row > :last-child) .children-row::before {
      /* no special styling needed */
    }
  `]
})
export class OrgNodeComponent {
  @Input() node!: OrgTreeNode;
  @Input() selectedId: string | null = null;
  @Output() onSelect = new EventEmitter<string>();
  @Output() onAddChild = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();
}
