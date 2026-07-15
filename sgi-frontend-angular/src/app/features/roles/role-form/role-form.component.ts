import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Role } from '../../../core/models';

@Component({
  selector: 'app-role-form',
  template: `
    <div class="modal-overlay" (click)="cancel.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ role ? 'Editar Rol' : 'Nuevo Rol' }}</h2>
          <button class="close-btn" (click)="cancel.emit()">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Nombre</label>
            <input type="text" [(ngModel)]="formData.name" placeholder="ej: auditor"
                   [disabled]="!!role" class="form-input">
            <small class="hint">Solo minúsculas y guiones bajos</small>
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <input type="text" [(ngModel)]="formData.description" placeholder="Descripción del rol"
                   class="form-input">
          </div>

          <div class="form-group" *ngIf="permissions">
            <label>Permisos ({{ selectedPermissions.length }}/{{ permissions.length }})</label>
            <div class="permissions-grid">
              <label *ngFor="let perm of permissions" class="perm-checkbox">
                <input type="checkbox"
                       [checked]="selectedPermissions.includes(perm)"
                       (change)="togglePermission(perm)">
                <span>{{ perm }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="cancel.emit()">Cancelar</button>
          <button class="btn btn-primary" (click)="onSave()" [disabled]="!formData.name || !formData.description">
            {{ role ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: #fff; border-radius: 12px; width: 90%; max-width: 600px; max-height: 80vh; display: flex; flex-direction: column; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #eee; }
    .modal-header h2 { margin: 0; font-size: 1.25rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #888; }
    .modal-body { padding: 1.5rem; overflow-y: auto; flex: 1; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.375rem; font-weight: 600; color: #333; font-size: 0.875rem; }
    .form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.875rem; }
    .form-input:disabled { background: #f5f5f5; }
    .form-input:focus { outline: none; border-color: #e94560; }
    .hint { color: #888; font-size: 0.75rem; }
    .permissions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.375rem; max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 6px; padding: 0.5rem; }
    .perm-checkbox { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem; font-size: 0.8rem; cursor: pointer; }
    .perm-checkbox:hover { background: #f8f9fa; border-radius: 4px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1rem 1.5rem; border-top: 1px solid #eee; }
    .btn { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; }
    .btn-primary { background: #e94560; color: #fff; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: #f0f0f0; color: #333; }
  `]
})
export class RoleFormComponent implements OnInit {
  @Input() role: Role | null = null;
  @Input() permissions: string[] | null = null;
  @Output() save = new EventEmitter<Partial<Role>>();
  @Output() cancel = new EventEmitter<void>();

  formData = { name: '', description: '' };
  selectedPermissions: string[] = [];

  ngOnInit(): void {
    if (this.role) {
      this.formData = { name: this.role.name, description: this.role.description };
      this.selectedPermissions = [...this.role.permissions];
    }
  }

  togglePermission(perm: string): void {
    const idx = this.selectedPermissions.indexOf(perm);
    if (idx >= 0) {
      this.selectedPermissions.splice(idx, 1);
    } else {
      this.selectedPermissions.push(perm);
    }
  }

  onSave(): void {
    this.save.emit({
      ...this.formData,
      permissions: this.selectedPermissions,
    });
  }
}
