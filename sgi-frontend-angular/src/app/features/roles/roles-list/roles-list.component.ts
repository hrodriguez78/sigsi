import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Role } from '../../../core/models';
import { selectRoles, selectRolesLoading } from '../../../store/roles/roles.selectors';
import * as RolesActions from '../../../store/roles/roles.actions';

@Component({
  selector: 'app-roles-list',
  template: `
    <div class="page-header">
      <h1>Roles y Permisos</h1>
      <button class="btn btn-primary" (click)="openForm()">+ Nuevo Rol</button>
    </div>

    <div class="table-container" *ngIf="roles$ | async as roles">
      <table class="data-table" *ngIf="roles.length > 0">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Permisos</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let role of roles">
            <td><span class="badge badge-info">{{ role.name }}</span></td>
            <td>{{ role.description }}</td>
            <td>
              <span class="perm-count">{{ role.permissions.length }} permisos</span>
            </td>
            <td>{{ role.created_at | date:'dd/MM/yyyy' }}</td>
            <td class="actions-cell">
              <button class="btn-icon" (click)="editRole(role)" title="Editar">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn-icon btn-danger" (click)="deleteRole(role)" title="Eliminar"
                      [disabled]="role.name === 'admin' || role.name === 'user'">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="empty-state" *ngIf="roles.length === 0">
        <span class="material-icons empty-icon">admin_panel_settings</span>
        <p>No hay roles definidos</p>
      </div>
    </div>

    <app-role-form
      *ngIf="showForm"
      [role]="editingRole"
      [permissions]="allPermissions$ | async"
      (save)="onSave($event)"
      (cancel)="showForm = false">
    </app-role-form>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; color: #1a1a2e; }
    .btn { padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500; }
    .btn-primary { background: #e94560; color: #fff; }
    .btn-primary:hover { background: #d63851; }
    .table-container { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem 1rem; text-align: left; }
    .data-table th { background: #f8f9fa; font-weight: 600; color: #555; border-bottom: 2px solid #eee; }
    .data-table td { border-bottom: 1px solid #f0f0f0; }
    .data-table tr:hover td { background: #f8f9fa; }
    .badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    .badge-info { background: #e3f2fd; color: #1565c0; }
    .perm-count { color: #888; font-size: 0.8rem; }
    .actions-cell { display: flex; gap: 0.25rem; }
    .btn-icon { background: none; border: none; cursor: pointer; padding: 0.25rem; border-radius: 4px; color: #666; }
    .btn-icon:hover { background: #f0f0f0; }
    .btn-icon.btn-danger { color: #e94560; }
    .btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }
    .empty-state { padding: 3rem; text-align: center; color: #888; }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; display: block; }
  `]
})
export class RolesListComponent implements OnInit {
  roles$: Observable<Role[]>;
  allPermissions$: Observable<string[]>;
  showForm = false;
  editingRole: Role | null = null;

  constructor(private store: Store) {
    this.roles$ = this.store.select(selectRoles);
    this.allPermissions$ = this.store.select(s => (s as any).roles.permissions);
  }

  ngOnInit(): void {
    this.store.dispatch(RolesActions.loadRoles({}));
    this.store.dispatch(RolesActions.loadPermissions());
  }

  openForm(): void {
    this.editingRole = null;
    this.showForm = true;
  }

  editRole(role: Role): void {
    this.editingRole = role;
    this.showForm = true;
  }

  onSave(data: Partial<Role>): void {
    if (this.editingRole) {
      this.store.dispatch(RolesActions.updateRole({ roleId: this.editingRole.id, changes: data }));
    } else {
      this.store.dispatch(RolesActions.createRole({ role: data }));
    }
    this.showForm = false;
  }

  deleteRole(role: Role): void {
    if (confirm(`¿Eliminar el rol "${role.name}"?`)) {
      this.store.dispatch(RolesActions.deleteRole({ roleId: role.id }));
    }
  }
}
