import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.reducer';
import { Observable, map } from 'rxjs';
import { selectDashboardKPIs } from '../../../store/dashboard/dashboard.selectors';

@Component({
  selector: 'app-widget-kpi-card',
  template: `
    <div class="kpi-card">
      <div class="kpi-value" [class]="metric">
        <span *ngIf="metric === 'compliance_pct'">{{ (value$ | async) || 0 }}%</span>
        <span *ngIf="metric === 'maturity_level'">{{ (value$ | async) || 0 }}/5</span>
        <span *ngIf="metric !== 'compliance_pct' && metric !== 'maturity_level'">{{ (value$ | async) || 0 }}</span>
      </div>
      <div class="kpi-progress" *ngIf="metric === 'compliance_pct'">
        <div class="progress-bar" [style.width.%]="value$ | async"></div>
      </div>
      <div class="kpi-label">{{ title }}</div>
    </div>
  `,
  styles: [`
    .kpi-card {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      text-align: center;
    }
    .kpi-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }
    .kpi-value.compliance_pct { color: var(--success, #10B981); }
    .kpi-value.maturity_level { color: var(--primary-color); }
    .kpi-value.pending_actions { color: var(--warning, #F59E0B); }
    .kpi-value.open_incidents { color: var(--danger, #EF4444); }
    .kpi-progress {
      width: 100%;
      height: 6px;
      background: var(--bg-muted);
      border-radius: 3px;
      margin: 0.5rem 0;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: var(--success, #10B981);
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    .kpi-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
  `]
})
export class WidgetKpiCardComponent implements OnInit {
  @Input() metric = '';
  @Input() title = '';

  value$: Observable<number> = new Observable();

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.value$ = this.store.select(selectDashboardKPIs).pipe(
      map((kpis: any) => kpis?.[this.metric] ?? 0)
    );
  }
}
