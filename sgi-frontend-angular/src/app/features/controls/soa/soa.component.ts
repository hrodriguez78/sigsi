import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { Control } from '../../../core/models';
import { AppState } from '../../../store/app.reducer';
import {
  selectControls,
  selectControlsLoading,
} from '../../../store/controls/controls.selectors';
import * as ControlActions from '../../../store/controls/controls.actions';

interface CategoryGroup {
  category: string;
  categoryLabel: string;
  controls: Control[];
}

@Component({
  selector: 'app-soa',
  templateUrl: './soa.component.html',
  styleUrls: ['./soa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SoAComponent implements OnInit, OnDestroy {
  loading$: Observable<boolean>;
  groupedControls$: Observable<CategoryGroup[]>;
  totalControls$: Observable<number>;
  implementedPct$: Observable<number>;
  compliancePct$: Observable<number>;

  private destroy$ = new Subject<void>();

  private categoryOrder = ['organizativo', 'personas', 'fisico', 'tecnologico'];
  private categoryLabels: Record<string, string> = {
    organizativo: 'Organizativo',
    personas: 'Personas',
    fisico: 'Físico',
    tecnologico: 'Tecnológico',
  };

  constructor(private store: Store<AppState>) {
    this.loading$ = this.store.select(selectControlsLoading);

    const controls$ = this.store.select(selectControls);

    this.groupedControls$ = controls$.pipe(
      map(controls => this.groupByCategory(controls))
    );

    this.totalControls$ = controls$.pipe(
      map(controls => controls.length)
    );

    this.implementedPct$ = controls$.pipe(
      map(controls => {
        if (controls.length === 0) return 0;
        const implemented = controls.filter(
          c => c.implementation_status === 'implementado' || c.implementation_status === 'efectivo'
        ).length;
        return Math.round((implemented / controls.length) * 100);
      })
    );

    this.compliancePct$ = controls$.pipe(
      map(controls => {
        if (controls.length === 0) return 0;
        const compliant = controls.filter(
          c => c.compliance_level === 'total'
        ).length;
        return Math.round((compliant / controls.length) * 100);
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(ControlActions.loadSoA({ organizationId: '' }));
    this.store.dispatch(
      ControlActions.loadControls({ organizationId: '' })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private groupByCategory(controls: Control[]): CategoryGroup[] {
    const groups: CategoryGroup[] = [];
    for (const cat of this.categoryOrder) {
      const catControls = controls.filter(c => c.category === cat);
      if (catControls.length > 0) {
        groups.push({
          category: cat,
          categoryLabel: this.categoryLabels[cat] || cat,
          controls: catControls,
        });
      }
    }
    return groups;
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

  getCategoryBadgeClass(category: string): string {
    const map: Record<string, string> = {
      organizativo: 'badge-organizativo',
      personas: 'badge-personas',
      fisico: 'badge-fisico',
      tecnologico: 'badge-tecnologico',
    };
    return map[category] || '';
  }
}
