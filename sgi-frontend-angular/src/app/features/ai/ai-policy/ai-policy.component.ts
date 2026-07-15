import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectPolicyResult } from '../../../store/ai/ai.selectors';
import * as AIActions from '../../../store/ai/ai.actions';

@Component({
  selector: 'app-ai-policy',
  template: `
    <div class="policy-container">
      <div class="policy-form" *ngIf="!(policyResult$ | async)">
        <h3>Generador de Políticas con IA</h3>
        <div class="form-group">
          <label>Tipo de documento</label>
          <select [(ngModel)]="policyType" class="form-input">
            <option value="politica">Política</option>
            <option value="procedimiento">Procedimiento</option>
            <option value="lineamiento">Lineamiento</option>
          </select>
        </div>
        <div class="form-group">
          <label>Título</label>
          <input type="text" [(ngModel)]="title" class="form-input" placeholder="Ej: Política de Control de Acceso">
        </div>
        <div class="form-group">
          <label>Alcance</label>
          <textarea [(ngModel)]="scope" class="form-input" rows="3"
                    placeholder="Describa el alcance de la política..."></textarea>
        </div>
        <div class="form-group">
          <label>Referencias ISO</label>
          <input type="text" [(ngModel)]="isoRefs" class="form-input"
                 placeholder="ISO 27001:2022, ISO 27002:2022">
        </div>
        <button class="btn btn-primary" (click)="generate()" [disabled]="!title || !scope">
          Generar Documento
        </button>
      </div>

      <div class="policy-result" *ngIf="policyResult$ | async as result">
        <div class="result-header">
          <h3>{{ result.title }}</h3>
          <button class="btn btn-secondary" (click)="reset()">Nuevo documento</button>
        </div>
        <div class="result-content" [innerHTML]="result.content | markdown"></div>
        <div class="result-meta">
          <span *ngFor="let ref of result.iso_references" class="badge badge-info">{{ ref }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .policy-container { max-width: 800px; }
    .policy-form, .policy-result { background: var(--card-bg); border-radius: 12px; padding: 1.5rem; box-shadow: var(--shadow-sm); }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.375rem; font-weight: 600; font-size: 0.875rem; color: var(--text-primary); }
    .form-input { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.875rem; }
    .form-input:focus { outline: none; border-color: var(--primary-color); }
    .btn { padding: 0.625rem 1.25rem; border: none; border-radius: 6px; font-weight: 500; cursor: pointer; }
    .btn-primary { background: var(--primary-color); color: #fff; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: var(--bg-tertiary); color: var(--text-primary); }
    .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .result-header h3 { margin: 0; color: var(--text-primary); }
    .result-content { background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; font-size: 0.875rem; line-height: 1.7; color: var(--text-primary); max-height: 500px; overflow-y: auto; white-space: pre-wrap; }
    .result-meta { margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; }
    .badge-info { background: #e3f2fd; color: #1565c0; }
  `]
})
export class AIPolicyComponent {
  policyResult$!: Observable<any>;
  policyType = 'politica';
  title = '';
  scope = '';
  isoRefs = '';

  constructor(private store: Store) {
    this.policyResult$ = this.store.select(selectPolicyResult);
  }

  generate(): void {
    const refs = this.isoRefs.split(',').map(r => r.trim()).filter(Boolean);
    this.store.dispatch(AIActions.generatePolicy({
      policyType: this.policyType,
      title: this.title,
      scope: this.scope,
      isoReferences: refs,
    }));
  }

  reset(): void {
    this.title = '';
    this.scope = '';
    this.isoRefs = '';
    this.store.dispatch(AIActions.generatePolicySuccess({ result: null }));
  }
}
