import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, switchMap, map, filter } from 'rxjs/operators';

import { Risk } from '../../../core/models';
import { AppState } from '../../../store/app.reducer';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import * as RiskActions from '../../../store/risks/risks.actions';
import * as RiskSelectors from '../../../store/risks/risks.selectors';

@Component({
  selector: 'app-risk-detail',
  templateUrl: './risk-detail.component.html',
  styleUrls: ['./risk-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskDetailComponent implements OnInit, OnDestroy {
  risk$!: Observable<Risk | undefined>;
  currentRisk: Risk | undefined;
  loading$ = this.store.select(RiskSelectors.selectRisksLoading);

  showDeleteDialog = false;
  matrixCells: { probability: number; impact: number; score: number; level: string }[][] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.risk$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id')!;
        return this.store.select(RiskSelectors.selectRisks).pipe(
          map(risks => risks.find(r => r.id === id)),
        );
      }),
    );

    this.risk$.pipe(takeUntil(this.destroy$)).subscribe(risk => {
      this.currentRisk = risk;
    });

    this.buildMatrix();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        const orgId = this.authService.currentUser?.organization_id;
        if (orgId) {
          this.store.dispatch(RiskActions.loadRisks({ organizationId: orgId, page: 1, pageSize: 100 }));
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildMatrix(): void {
    this.matrixCells = [];
    for (let p = 5; p >= 1; p--) {
      const row: { probability: number; impact: number; score: number; level: string }[] = [];
      for (let i = 1; i <= 5; i++) {
        const score = p * i;
        row.push({
          probability: p,
          impact: i,
          score,
          level: this.getLevelFromScore(score),
        });
      }
      this.matrixCells.push(row);
    }
  }

  getLevelFromScore(score: number): string {
    if (score <= 4) return 'bajo';
    if (score <= 8) return 'medio';
    if (score <= 12) return 'alto';
    return 'critico';
  }

  getLevelColor(level: string): string {
    const colors: Record<string, string> = {
      bajo: 'level--bajo',
      medio: 'level--medio',
      alto: 'level--alto',
      critico: 'level--critico',
    };
    return colors[level] || '';
  }

  getCellClass(probability: number, impact: number, risk: Risk | undefined): string {
    if (!risk) return '';
    if (probability === risk.probability && impact === risk.impact) {
      return 'matrix-cell--active';
    }
    return '';
  }

  getScoreColor(score: number): string {
    if (score <= 4) return 'score--bajo';
    if (score <= 8) return 'score--medio';
    if (score <= 12) return 'score--alto';
    return 'score--critico';
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

  getStatusSteps(): string[] {
    return ['identificado', 'en_analisis', 'en_tratamiento', 'en_seguimiento', 'cerrado'];
  }

  isStatusActive(currentStatus: string, stepStatus: string): boolean {
    const steps = this.getStatusSteps();
    const currentIdx = steps.indexOf(currentStatus);
    const stepIdx = steps.indexOf(stepStatus);
    return stepIdx <= currentIdx;
  }

  editRisk(risk: Risk): void {
    this.router.navigate(['/risks', risk.id, 'edit']);
  }

  confirmDelete(): void {
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    if (this.currentRisk) {
      this.deleteRisk(this.currentRisk);
    }
  }

  deleteRisk(risk: Risk): void {
    this.store.dispatch(RiskActions.deleteRisk({ id: risk.id }));
    this.showDeleteDialog = false;
    this.router.navigate(['/risks']);
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  goBack(): void {
    this.router.navigate(['/risks']);
  }
}
