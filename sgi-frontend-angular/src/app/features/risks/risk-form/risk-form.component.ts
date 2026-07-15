import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { takeUntil, map, filter } from 'rxjs/operators';

import { Risk } from '../../../core/models';
import { AppState } from '../../../store/app.reducer';
import { AuthService } from '../../../core/services/auth.service';
import * as RiskActions from '../../../store/risks/risks.actions';
import * as RiskSelectors from '../../../store/risks/risks.selectors';

@Component({
  selector: 'app-risk-form',
  templateUrl: './risk-form.component.html',
  styleUrls: ['./risk-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  riskId: string | null = null;
  previewScore = 0;
  previewLevel = 'bajo';

  matrixCells: { probability: number; impact: number; score: number; level: string }[][] = [];

  categories = [
    { value: 'estrategico', label: 'Estratégico' },
    { value: 'operativo', label: 'Operativo' },
    { value: 'cumplimiento', label: 'Cumplimiento' },
    { value: 'financiero', label: 'Financiero' },
    { value: 'reputacional', label: 'Reputacional' },
    { value: 'tecnico', label: 'Técnico' },
  ];

  treatments = [
    { value: 'mitigar', label: 'Mitigar' },
    { value: 'transferir', label: 'Transferir' },
    { value: 'evitar', label: 'Evitar' },
    { value: 'aceptar', label: 'Aceptar' },
  ];

  statuses = [
    { value: 'identificado', label: 'Identificado' },
    { value: 'en_analisis', label: 'En Análisis' },
    { value: 'en_tratamiento', label: 'En Tratamiento' },
    { value: 'en_seguimiento', label: 'En Seguimiento' },
    { value: 'aceptado', label: 'Aceptado' },
    { value: 'cerrado', label: 'Cerrado' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private authService: AuthService,
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.buildMatrix();

    this.riskId = this.route.snapshot.paramMap.get('id');
    if (this.riskId) {
      this.isEditMode = true;
      this.loadRiskData();
    }

    this.form.get('probability')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updatePreview());

    this.form.get('impact')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updatePreview());

    this.updatePreview();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      category: ['operativo', Validators.required],
      source: [''],
      consequence: [''],
      probability: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      impact: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      treatment: ['mitigar'],
      treatment_plan: [''],
      status: ['identificado', Validators.required],
      asset_id: [''],
      process_id: [''],
    });
  }

  private loadRiskData(): void {
    this.store.select(RiskSelectors.selectRisks).pipe(
      map(risks => risks.find(r => r.id === this.riskId)),
      filter(risk => !!risk),
      takeUntil(this.destroy$),
    ).subscribe(risk => {
      if (risk) {
        this.form.patchValue({
          name: risk.name,
          code: risk.code,
          description: risk.description,
          category: risk.category,
          source: risk.source,
          consequence: risk.consequence,
          probability: risk.probability,
          impact: risk.impact,
          treatment: risk.treatment || 'mitigar',
          treatment_plan: risk.treatment_plan,
          status: risk.status,
          asset_id: risk.asset_id || '',
          process_id: risk.process_id || '',
        });
        this.updatePreview();
      }
    });
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

  updatePreview(): void {
    const p = this.form.get('probability')?.value || 1;
    const i = this.form.get('impact')?.value || 1;
    this.previewScore = p * i;
    this.previewLevel = this.getLevelFromScore(this.previewScore);
  }

  getPreviewScoreColor(): string {
    return 'score--' + this.previewLevel;
  }

  getPreviewLevelLabel(): string {
    const labels: Record<string, string> = {
      bajo: 'Bajo',
      medio: 'Medio',
      alto: 'Alto',
      critico: 'Crítico',
    };
    return labels[this.previewLevel] || '';
  }

  getCellClass(probability: number, impact: number): string {
    const currentP = this.form.get('probability')?.value || 1;
    const currentI = this.form.get('impact')?.value || 1;
    if (probability === currentP && impact === currentI) {
      return 'matrix-cell--active';
    }
    return '';
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const orgId = this.authService.currentUser?.organization_id;
    if (!orgId) return;

    const formValue = this.form.value;
    const score = formValue.probability * formValue.impact;

    const data: Partial<Risk> = {
      ...formValue,
      organization_id: orgId,
      risk_score: score,
      risk_level: this.getLevelFromScore(score),
    };

    if (this.isEditMode && this.riskId) {
      this.store.dispatch(RiskActions.updateRisk({ id: this.riskId, data }));
    } else {
      this.store.dispatch(RiskActions.createRisk({ data }));
    }

    this.router.navigate(['/risks']);
  }

  goBack(): void {
    this.router.navigate(['/risks']);
  }
}
