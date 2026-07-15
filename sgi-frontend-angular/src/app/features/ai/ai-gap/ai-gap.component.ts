import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectGapResult } from '../../../store/ai/ai.selectors';
import * as AIActions from '../../../store/ai/ai.actions';

@Component({
  selector: 'app-ai-gap',
  template: `
    <div class="gap-container">
      <div class="gap-form" *ngIf="!(gapResult$ | async)">
        <h3>Análisis de Brechas - ISO 27001</h3>
        <div class="form-group">
          <label>Estándar</label>
          <input type="text" [(ngModel)]="standard" class="form-input" value="ISO 27001:2022">
        </div>
        <div class="form-group">
          <label>Descripción del alcance</label>
          <textarea [(ngModel)]="scopeDesc" class="form-input" rows="4"
                    placeholder="Describa las áreas/procesos a evaluar..."></textarea>
        </div>
        <button class="btn btn-primary" (click)="runAnalysis()" [disabled]="!scopeDesc">
          Ejecutar Análisis
        </button>
      </div>

      <div class="gap-result" *ngIf="gapResult$ | async as result">
        <div class="result-header">
          <h3>Resultado del Análisis</h3>
          <button class="btn btn-secondary" (click)="reset()">Nuevo análisis</button>
        </div>

        <div class="summary-cards">
          <div class="summary-card">
            <span class="summary-value">{{ result.total_controls }}</span>
            <span class="summary-label">Total Controles</span>
          </div>
          <div class="summary-card green">
            <span class="summary-value">{{ result.implemented }}</span>
            <span class="summary-label">Implementados</span>
          </div>
          <div class="summary-card red">
            <span class="summary-value">{{ result.gaps?.length || 0 }}</span>
            <span class="summary-label">Brechas</span>
          </div>
          <div class="summary-card">
            <span class="summary-value">{{ result.compliance_score }}%</span>
            <span class="summary-label">Cumplimiento</span>
          </div>
        </div>

        <p class="summary-text">{{ result.summary }}</p>

        <div class="gaps-table" *ngIf="result.gaps?.length > 0">
          <h4>Brechas Identificadas</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Control</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Prioridad</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let gap of result.gaps">
                <td>{{ gap.control_id }} - {{ gap.control_name }}</td>
                <td>{{ gap.category }}</td>
                <td><span class="badge badge-warning">{{ gap.status }}</span></td>
                <td><span [class]="'badge badge-' + gap.priority">{{ gap.priority }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gap-container { max-width: 900px; }
    .gap-form, .gap-result { background: var(--card-bg); border-radius: 12px; padding: 1.5rem; box-shadow: var(--shadow-sm); }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.375rem; font-weight: 600; font-size: 0.875rem; }
    .form-input { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); }
    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; }
    .btn-primary { background: var(--primary-color); color: #fff; }
    .btn-primary:disabled { opacity: 0.5; }
    .btn-secondary { background: var(--bg-tertiary); color: var(--text-primary); }
    .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .summary-card { background: var(--bg-secondary); border-radius: 8px; padding: 1rem; text-align: center; }
    .summary-value { display: block; font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
    .summary-label { font-size: 0.75rem; color: var(--text-muted); }
    .summary-card.green .summary-value { color: #4caf50; }
    .summary-card.red .summary-value { color: #e94560; }
    .summary-text { color: var(--text-secondary); margin-bottom: 1rem; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid var(--border-color); font-size: 0.8rem; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; }
    .badge-warning { background: #fff3e0; color: #e65100; }
    .badge-alto { background: #ffebee; color: #c62828; }
    .badge-medio { background: #fff3e0; color: #e65100; }
  `]
})
export class AIGapComponent {
  gapResult$!: Observable<any>;
  standard = 'ISO 27001:2022';
  scopeDesc = '';

  constructor(private store: Store) {
    this.gapResult$ = this.store.select(selectGapResult);
  }

  runAnalysis(): void {
    this.store.dispatch(AIActions.runGapAnalysis({
      standard: this.standard,
      scopeDescription: this.scopeDesc,
    }));
  }

  reset(): void {
    this.scopeDesc = '';
    this.store.dispatch(AIActions.runGapAnalysisSuccess({ result: null }));
  }
}
