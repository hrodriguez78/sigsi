import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Control } from '../../../core/models';
import { AppState } from '../../../store/app.reducer';
import {
  selectControls,
  selectControlsLoading,
  selectControlsTotal,
} from '../../../store/controls/controls.selectors';
import * as ControlActions from '../../../store/controls/controls.actions';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-controls-list',
  templateUrl: './controls-list.component.html',
  styleUrls: ['./controls-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlsListComponent implements OnInit, OnDestroy {
  controls$: Observable<Control[]>;
  loading$: Observable<boolean>;
  total$: Observable<number>;

  search = '';
  filterCategory = '';
  filterImplementation = '';
  filterCompliance = '';
  currentPage = 1;
  pageSize = 20;

  showDeleteDialog = false;
  controlToDelete: Control | null = null;

  categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    { value: 'organizativo', label: 'Organizativo' },
    { value: 'personas', label: 'Personas' },
    { value: 'fisico', label: 'Físico' },
    { value: 'tecnologico', label: 'Tecnológico' },
  ];

  implementationOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'no_iniciado', label: 'No Iniciado' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'implementado', label: 'Implementado' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'no_aplicable', label: 'No Aplicable' },
  ];

  complianceOptions = [
    { value: '', label: 'Todos los niveles' },
    { value: 'total', label: 'Total' },
    { value: 'parcial', label: 'Parcial' },
    { value: 'minimo', label: 'Mínimo' },
    { value: 'ninguno', label: 'Ninguno' },
    { value: 'no_evaluado', label: 'No Evaluado' },
  ];

  private destroy$ = new Subject<void>();

  constructor(private store: Store<AppState>, private exportService: ExportService) {
    this.controls$ = this.store.select(selectControls);
    this.loading$ = this.store.select(selectControlsLoading);
    this.total$ = this.store.select(selectControlsTotal);
  }

  ngOnInit(): void {
    this.loadControls();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadControls(): void {
    this.store.dispatch(
      ControlActions.loadControls({
        organizationId: '',
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.search || undefined,
        category: this.filterCategory || undefined,
        implementationStatus: this.filterImplementation || undefined,
      })
    );
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadControls();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadControls();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadControls();
  }

  exportData(): void {
    this.exportService.exportModule('controls');
  }

  confirmDelete(control: Control): void {
    this.controlToDelete = control;
    this.showDeleteDialog = true;
  }

  onDeleteConfirm(): void {
    if (this.controlToDelete) {
      this.store.dispatch(ControlActions.deleteControl({ id: this.controlToDelete.id }));
      this.showDeleteDialog = false;
      this.controlToDelete = null;
    }
  }

  onDeleteCancel(): void {
    this.showDeleteDialog = false;
    this.controlToDelete = null;
  }

  getCategoryBadgeClass(category: string): string {
    const map: Record<string, string> = {
      organizativo: 'badge-organizativo',
      personas: 'badge-personas',
      fisico: 'badge-fisico',
      tecnologico: 'badge-tecnologico',
    };
    return map[category] || '';
  }

  getCategoryLabel(category: string): string {
    const map: Record<string, string> = {
      organizativo: 'Organizativo',
      personas: 'Personas',
      fisico: 'Físico',
      tecnologico: 'Tecnológico',
    };
    return map[category] || category;
  }

  getImplementationClass(status: string): string {
    const map: Record<string, string> = {
      no_iniciado: 'impl-no-iniciado',
      en_progreso: 'impl-en-progreso',
      implementado: 'impl-implementado',
      efectivo: 'impl-efectivo',
      no_aplicable: 'impl-no-aplicable',
    };
    return map[status] || '';
  }

  getImplementationLabel(status: string): string {
    const map: Record<string, string> = {
      no_iniciado: 'No Iniciado',
      en_progreso: 'En Progreso',
      implementado: 'Implementado',
      efectivo: 'Efectivo',
      no_aplicable: 'No Aplicable',
    };
    return map[status] || status;
  }

  getComplianceClass(level: string): string {
    const map: Record<string, string> = {
      total: 'comp-total',
      parcial: 'comp-parcial',
      minimo: 'comp-minimo',
      ninguno: 'comp-ninguno',
      no_evaluado: 'comp-no-evaluado',
    };
    return map[level] || '';
  }

  getComplianceLabel(level: string): string {
    const map: Record<string, string> = {
      total: 'Total',
      parcial: 'Parcial',
      minimo: 'Mínimo',
      ninguno: 'Ninguno',
      no_evaluado: 'No Evaluado',
    };
    return map[level] || level;
  }
}
