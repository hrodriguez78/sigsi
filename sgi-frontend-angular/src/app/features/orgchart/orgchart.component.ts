import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../store/app.reducer';
import { OrgTreeNode, OrgPosition } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import * as OrgChartActions from '../../store/orgchart/orgchart.actions';
import { selectOrgTree, selectOrgPositions, selectOrgChartLoading } from '../../store/orgchart/orgchart.selectors';

@Component({
  selector: 'app-orgchart',
  template: `
    <div class="orgchart-page">
      <div class="page-header">
        <div>
          <h1>Organigrama</h1>
          <p class="subtitle">Estructura jerárquica de la organización</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" (click)="showForm = true; editingPosition = null">
            <span class="material-icons">add</span> Nuevo Cargo
          </button>
        </div>
      </div>

      <div class="orgchart-container" *ngIf="!(loading$ | async)">
        <div class="tree-view" *ngIf="tree$ | async as tree">
          <app-org-node [node]="tree" [selectedId]="selectedId"
                        (onSelect)="selectNode($event)"
                        (onAddChild)="addChild($event)"
                        (onDelete)="deleteNode($event)">
          </app-org-node>
        </div>
        <div class="empty-state" *ngIf="!(tree$ | async)">
          <span class="material-icons empty-icon">account_tree</span>
          <h3>Sin estructura definida</h3>
          <p>Crea el primer cargo para comenzar el organigrama</p>
          <button class="btn-primary" (click)="showForm = true">
            <span class="material-icons">add</span> Crear Cargo Raíz
          </button>
        </div>
      </div>

      <div class="loading" *ngIf="loading$ | async">
        <span class="material-icons spinning">refresh</span>
      </div>

      <div class="position-detail-panel" *ngIf="selectedPosition$ | async as pos"
           (click)="$event.stopPropagation()">
        <div class="panel-header">
          <h3>{{ pos.name }}</h3>
          <button class="close-btn" (click)="selectedId = null">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="panel-body">
          <div class="detail-row" *ngIf="pos.holder_name">
            <span class="detail-label">Titular</span>
            <span class="detail-value">{{ pos.holder_name }}</span>
          </div>
          <div class="detail-row" *ngIf="pos.holder_email">
            <span class="detail-label">Email</span>
            <span class="detail-value">{{ pos.holder_email }}</span>
          </div>
          <div class="detail-row" *ngIf="pos.department">
            <span class="detail-label">Departamento</span>
            <span class="detail-value">{{ pos.department }}</span>
          </div>
          <div class="detail-row" *ngIf="pos.description">
            <span class="detail-label">Descripción</span>
            <span class="detail-value">{{ pos.description }}</span>
          </div>
          <div class="detail-row" *ngIf="pos.responsibilities?.length">
            <span class="detail-label">Responsabilidades</span>
            <ul class="responsibilities-list">
              <li *ngFor="let r of pos.responsibilities">{{ r }}</li>
            </ul>
          </div>
        </div>
        <div class="panel-actions">
          <button class="btn-secondary" (click)="editPosition(pos)">
            <span class="material-icons">edit</span> Editar
          </button>
          <button class="btn-danger" (click)="deleteNode(pos.id)">
            <span class="material-icons">delete</span> Eliminar
          </button>
        </div>
      </div>

      <div class="position-form-overlay" *ngIf="showForm" (click)="showForm = false">
        <div class="position-form-card" (click)="$event.stopPropagation()">
          <div class="form-header">
            <h3>{{ editingPosition ? 'Editar Cargo' : 'Nuevo Cargo' }}</h3>
            <button class="close-btn" (click)="showForm = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="form-body">
            <div class="form-group">
              <label>Nombre del cargo *</label>
              <input type="text" [(ngModel)]="formData.name" placeholder="Ej: Director de TI">
            </div>
            <div class="form-group">
              <label>Titular</label>
              <input type="text" [(ngModel)]="formData.holder_name" placeholder="Nombre del titular">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" [(ngModel)]="formData.holder_email" placeholder="email@empresa.com">
            </div>
            <div class="form-group">
              <label>Departamento</label>
              <input type="text" [(ngModel)]="formData.department" placeholder="Ej: Tecnología">
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="formData.description" rows="2" placeholder="Descripción del cargo"></textarea>
            </div>
            <div class="form-group">
              <label>Cargo padre</label>
              <select [(ngModel)]="formData.parent_id">
                <option [ngValue]="null">Ninguno (cargo raíz)</option>
                <option *ngFor="let p of positions$ | async" [ngValue]="p.id">
                  {{ p.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Responsabilidades (una por línea)</label>
              <textarea [(ngModel)]="responsibilitiesText" rows="3"
                        placeholder="Gestionar infraestructura&#10;Supervisar equipo técnico&#10;Definir políticas"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-secondary" (click)="showForm = false">Cancelar</button>
            <button class="btn-primary" (click)="savePosition()" [disabled]="!formData.name">
              {{ editingPosition ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./orgchart.component.scss']
})
export class OrgchartComponent implements OnInit {
  tree$: Observable<OrgTreeNode | null>;
  positions$: Observable<OrgPosition[]>;
  loading$: Observable<boolean>;
  selectedPosition$: Observable<OrgPosition | null>;

  selectedId: string | null = null;
  showForm = false;
  editingPosition: OrgPosition | null = null;
  parentIdForNew: string | null = null;
  responsibilitiesText = '';

  formData = {
    name: '',
    holder_name: '',
    holder_email: '',
    department: '',
    description: '',
    parent_id: null as string | null,
  };

  private organizationId = '';

  constructor(
    private store: Store<AppState>,
    private authService: AuthService
  ) {
    this.tree$ = this.store.select(selectOrgTree);
    this.positions$ = this.store.select(selectOrgPositions);
    this.loading$ = this.store.select(selectOrgChartLoading);
    this.selectedPosition$ = this.store.select((s) => {
      const id = s.orgchart.selectedPositionId;
      return s.orgchart.positions.find((p: OrgPosition) => p.id === id) || null;
    });
  }

  ngOnInit() {
    this.authService.user$.subscribe((user: any) => {
      this.organizationId = user?.organization_id || '';
      if (this.organizationId) {
        this.store.dispatch(OrgChartActions.loadOrgChart({ organizationId: this.organizationId }));
      }
    });
  }

  selectNode(id: string) {
    this.selectedId = id;
    this.store.dispatch(OrgChartActions.setSelectedPosition({ positionId: id }));
  }

  addChild(parentId: string) {
    this.parentIdForNew = parentId;
    this.editingPosition = null;
    this.resetForm();
    this.formData.parent_id = parentId;
    this.showForm = true;
  }

  editPosition(pos: OrgPosition) {
    this.editingPosition = pos;
    this.formData = {
      name: pos.name,
      holder_name: pos.holder_name || '',
      holder_email: pos.holder_email || '',
      department: pos.department || '',
      description: pos.description || '',
      parent_id: pos.parent_id || null,
    };
    this.responsibilitiesText = (pos.responsibilities || []).join('\n');
    this.showForm = true;
  }

  deleteNode(id: string) {
    if (confirm('¿Eliminar este cargo? Los hijos se reasignarán al padre.')) {
      this.store.dispatch(OrgChartActions.deletePosition({ id }));
      this.selectedId = null;
    }
  }

  savePosition() {
    const data: Partial<OrgPosition> = {
      name: this.formData.name,
      holder_name: this.formData.holder_name || undefined,
      holder_email: this.formData.holder_email || undefined,
      department: this.formData.department || undefined,
      description: this.formData.description || undefined,
      parent_id: this.formData.parent_id || undefined,
      responsibilities: this.responsibilitiesText.split('\n').filter((l) => l.trim()),
    };

    if (this.editingPosition) {
      this.store.dispatch(OrgChartActions.updatePosition({ id: this.editingPosition.id, data }));
    } else {
      this.store.dispatch(OrgChartActions.createPosition({ organizationId: this.organizationId, data }));
    }
    this.showForm = false;
    this.resetForm();
  }

  private resetForm() {
    this.formData = { name: '', holder_name: '', holder_email: '', department: '', description: '', parent_id: null };
    this.responsibilitiesText = '';
  }
}
