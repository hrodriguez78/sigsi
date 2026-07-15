import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { Process } from '../../../core/models';
import { AppState } from '../../../store/app.reducer';
import {
  selectProcesses,
  selectProcessesLoading,
  selectProcessesTotal,
} from '../../../store/processes/processes.selectors';
import { selectSelectedOrganization } from '../../../store/organizations/organizations.selectors';
import * as ProcessActions from '../../../store/processes/processes.actions';
import * as OrgActions from '../../../store/organizations/organizations.actions';

@Component({
  selector: 'app-processes-list',
  templateUrl: './processes-list.component.html',
  styleUrls: ['./processes-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessesListComponent implements OnInit, OnDestroy {
  processes$: Observable<Process[]>;
  loading$: Observable<boolean>;
  total$: Observable<number>;
  selectedOrg$: Observable<any>;

  search = '';
  filterType = '';
  filterStatus = '';
  currentPage = 1;
  pageSize = 20;

  showDeleteDialog = false;
  processToDelete: Process | null = null;

  processTypeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'estrategico', label: 'Estratégico' },
    { value: 'tactico', label: 'Táctico' },
    { value: 'operativo', label: 'Operativo' },
    { value: 'soporte', label: 'Soporte' },
  ];

  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'borrador', label: 'Borrador' },
    { value: 'en_revision', label: 'En Revisión' },
  ];

  private destroy$ = new Subject<void>();
  private currentOrgId: string = '';

  constructor(private store: Store<AppState>) {
    this.processes$ = this.store.select(selectProcesses);
    this.loading$ = this.store.select(selectProcessesLoading);
    this.total$ = this.store.select(selectProcessesTotal);
    this.selectedOrg$ = this.store.select(selectSelectedOrganization);
  }

  ngOnInit(): void {
    this.store.dispatch(OrgActions.loadOrganizations({ page: 1, pageSize: 50 }));

    this.selectedOrg$.pipe(takeUntil(this.destroy$)).subscribe(org => {
      this.currentOrgId = org?.id || '';
      this.loadProcesses();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProcesses(): void {
    this.store.dispatch(
      ProcessActions.loadProcesses({
        organizationId: this.currentOrgId,
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.search,
        processType: this.filterType || undefined,
        status: this.filterStatus || undefined,
      })
    );
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProcesses();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProcesses();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProcesses();
  }

  confirmDelete(process: Process): void {
    this.processToDelete = process;
    this.showDeleteDialog = true;
  }

  onDeleteConfirm(): void {
    if (this.processToDelete) {
      this.store.dispatch(ProcessActions.deleteProcess({ id: this.processToDelete.id }));
      this.showDeleteDialog = false;
      this.processToDelete = null;
    }
  }

  onDeleteCancel(): void {
    this.showDeleteDialog = false;
    this.processToDelete = null;
  }

  getTypeBadgeClass(type: string): string {
    const map: Record<string, string> = {
      estrategico: 'badge-estrategico',
      tactico: 'badge-tactico',
      operativo: 'badge-operativo',
      soporte: 'badge-soporte',
    };
    return map[type] || '';
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      activo: 'activo',
      inactivo: 'inactivo',
      borrador: 'borrador',
      en_revision: 'en_revision',
    };
    return map[status] || '';
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      estrategico: 'Estratégico',
      tactico: 'Táctico',
      operativo: 'Operativo',
      soporte: 'Soporte',
    };
    return map[type] || type;
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      activo: 'Activo',
      inactivo: 'Inactivo',
      borrador: 'Borrador',
      en_revision: 'En Revisión',
    };
    return map[status] || status;
  }
}
