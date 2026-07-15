import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';

import { Control } from '../../../core/models';
import { AppState } from '../../../store/app.reducer';
import { selectControls } from '../../../store/controls/controls.selectors';
import * as ControlActions from '../../../store/controls/controls.actions';

@Component({
  selector: 'app-control-detail',
  templateUrl: './control-detail.component.html',
  styleUrls: ['./control-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlDetailComponent implements OnInit, OnDestroy {
  control$: Observable<Control | undefined> = of(undefined);
  controlId = '';
  showDeleteDialog = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.controlId = this.route.snapshot.paramMap.get('id') || '';
    this.control$ = this.store.select(selectControls).pipe(
      map(controls => controls.find(c => c.id === this.controlId))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  getCategoryBadgeClass(category: string): string {
    const map: Record<string, string> = {
      organizativo: 'badge-organizativo',
      personas: 'badge-personas',
      fisico: 'badge-fisico',
      tecnologico: 'badge-tecnologico',
    };
    return map[category] || '';
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

  confirmDelete(): void {
    this.showDeleteDialog = true;
  }

  onDeleteConfirm(): void {
    this.store.dispatch(ControlActions.deleteControl({ id: this.controlId }));
    this.showDeleteDialog = false;
    this.router.navigate(['/controls']);
  }

  onDeleteCancel(): void {
    this.showDeleteDialog = false;
  }
}
