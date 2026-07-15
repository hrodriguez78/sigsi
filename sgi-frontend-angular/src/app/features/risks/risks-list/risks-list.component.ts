import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

import { Risk } from '../../../core/models';
import { AppState } from '../../../store/app.reducer';
import { AuthService } from '../../../core/services/auth.service';
import { ExportService } from '../../../core/services/export.service';
import * as RiskActions from '../../../store/risks/risks.actions';
import * as RiskSelectors from '../../../store/risks/risks.selectors';

@Component({
  selector: 'app-risks-list',
  templateUrl: './risks-list.component.html',
  styleUrls: ['./risks-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RisksListComponent implements OnInit, OnDestroy {
  risks$ = this.store.select(RiskSelectors.selectRisks);
  loading$ = this.store.select(RiskSelectors.selectRisksLoading);
  total$ = this.store.select(RiskSelectors.selectRisksTotal);

  searchControl = new FormControl('');
  categoryFilter = new FormControl('');
  riskLevelFilter = new FormControl('');
  statusFilter = new FormControl('');

  currentPage = 1;
  pageSize = 20;

  categories = [
    { value: '', label: 'Todas' },
    { value: 'estrategico', label: 'Estratégico' },
    { value: 'operativo', label: 'Operativo' },
    { value: 'cumplimiento', label: 'Cumplimiento' },
    { value: 'financiero', label: 'Financiero' },
    { value: 'reputacional', label: 'Reputacional' },
    { value: 'tecnico', label: 'Técnico' },
  ];

  riskLevels = [
    { value: '', label: 'Todos' },
    { value: 'bajo', label: 'Bajo' },
    { value: 'medio', label: 'Medio' },
    { value: 'alto', label: 'Alto' },
    { value: 'critico', label: 'Crítico' },
  ];

  statuses = [
    { value: '', label: 'Todos' },
    { value: 'identificado', label: 'Identificado' },
    { value: 'en_analisis', label: 'En Análisis' },
    { value: 'en_tratamiento', label: 'En Tratamiento' },
    { value: 'en_seguimiento', label: 'En Seguimiento' },
    { value: 'aceptado', label: 'Aceptado' },
    { value: 'cerrado', label: 'Cerrado' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private router: Router,
    private exportService: ExportService,
  ) {}

  ngOnInit(): void {
    this.loadRisks();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadRisks();
      });

    this.categoryFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadRisks();
      });

    this.riskLevelFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadRisks();
      });

    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 1;
        this.loadRisks();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRisks(): void {
    const orgId = this.authService.currentUser?.organization_id;
    if (!orgId) return;

    this.store.dispatch(
      RiskActions.loadRisks({
        organizationId: orgId,
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchControl.value || undefined,
        category: this.categoryFilter.value || undefined,
        riskLevel: this.riskLevelFilter.value || undefined,
        status: this.statusFilter.value || undefined,
      }),
    );
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRisks();
  }

  exportData(): void {
    this.exportService.exportModule('risks');
  }

  viewRisk(risk: Risk): void {
    this.router.navigate(['/risks', risk.id]);
  }

  getLevelColor(level: string): string {
    const colors: Record<string, string> = {
      bajo: 'badge--green',
      medio: 'badge--yellow',
      alto: 'badge--orange',
      critico: 'badge--red',
    };
    return colors[level] || '';
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      estrategico: 'Estratégico',
      operativo: 'Operativo',
      cumplimiento: 'Cumplimiento',
      financiero: 'Financiero',
      reputacional: 'Reputacional',
      tecnico: 'Técnico',
    };
    return labels[category] || category;
  }

  getLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      bajo: 'Bajo',
      medio: 'Medio',
      alto: 'Alto',
      critico: 'Crítico',
    };
    return labels[level] || level;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      identificado: 'Identificado',
      en_analisis: 'En Análisis',
      en_tratamiento: 'En Tratamiento',
      en_seguimiento: 'En Seguimiento',
      aceptado: 'Aceptado',
      cerrado: 'Cerrado',
    };
    return labels[status] || status;
  }

  getTreatmentLabel(treatment: string | undefined): string {
    if (!treatment) return '-';
    const labels: Record<string, string> = {
      mitigar: 'Mitigar',
      transferir: 'Transferir',
      evitar: 'Evitar',
      aceptar: 'Aceptar',
    };
    return labels[treatment] || treatment;
  }
}
