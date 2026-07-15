import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Risk } from '../../../core/models';
import { AppState } from '../../../store/app.reducer';
import { AuthService } from '../../../core/services/auth.service';
import * as RiskActions from '../../../store/risks/risks.actions';
import * as RiskSelectors from '../../../store/risks/risks.selectors';

interface MatrixCell {
  probability: number;
  impact: number;
  score: number;
  level: string;
  count: number;
  risks: Risk[];
}

@Component({
  selector: 'app-risk-matrix',
  templateUrl: './risk-matrix.component.html',
  styleUrls: ['./risk-matrix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskMatrixComponent implements OnInit, OnDestroy {
  matrixCells: MatrixCell[][] = [];
  selectedCell: MatrixCell | null = null;
  loading = false;

  probabilityLabels = ['Muy Baja', 'Baja', 'Media', 'Alta', 'Muy Alta'];
  impactLabels = ['Insignificante', 'Menor', 'Moderado', 'Mayor', 'Crítico'];

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadMatrix();

    this.store.select(RiskSelectors.selectRisksLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMatrix(): void {
    const orgId = this.authService.currentUser?.organization_id;
    if (!orgId) return;

    this.store.dispatch(RiskActions.loadRisks({ organizationId: orgId, page: 1, pageSize: 200 }));
    this.store.dispatch(RiskActions.loadRiskMatrix({ organizationId: orgId }));

    this.store.select(RiskSelectors.selectRisks)
      .pipe(takeUntil(this.destroy$))
      .subscribe(risks => {
        this.buildMatrix(risks);
      });
  }

  buildMatrix(risks: Risk[]): void {
    this.matrixCells = [];
    for (let p = 5; p >= 1; p--) {
      const row: MatrixCell[] = [];
      for (let i = 1; i <= 5; i++) {
        const score = p * i;
        const cellRisks = risks.filter(r => r.probability === p && r.impact === i);
        row.push({
          probability: p,
          impact: i,
          score,
          level: this.getLevelFromScore(score),
          count: cellRisks.length,
          risks: cellRisks,
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

  selectCell(cell: MatrixCell): void {
    if (this.selectedCell === cell) {
      this.selectedCell = null;
    } else {
      this.selectedCell = cell;
    }
  }

  viewRisk(risk: Risk): void {
    this.router.navigate(['/risks', risk.id]);
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

  getLevelColor(level: string): string {
    const colors: Record<string, string> = {
      bajo: 'badge--green',
      medio: 'badge--yellow',
      alto: 'badge--orange',
      critico: 'badge--red',
    };
    return colors[level] || '';
  }

  goBack(): void {
    this.router.navigate(['/risks']);
  }
}
