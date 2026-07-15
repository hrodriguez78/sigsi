import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.reducer';
import { Subscription } from 'rxjs';
import { selectIncidentStats } from '../../../store/incidents/incidents.selectors';

@Component({
  selector: 'app-widget-incident-summary',
  template: `
    <div class="incident-summary">
      <div class="summary-row" *ngFor="let item of items">
        <span class="summary-label">{{ item.label }}</span>
        <span class="summary-badge" [style.background]="item.color + '20'" [style.color]="item.color">
          {{ item.value }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .incident-summary {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      height: 100%;
      justify-content: center;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
      border-bottom: 1px solid var(--border-color);
    }
    .summary-row:last-child { border-bottom: none; }
    .summary-label {
      font-size: 0.8125rem;
      color: var(--text-primary);
    }
    .summary-badge {
      padding: 0.25rem 0.625rem;
      border-radius: 12px;
      font-size: 0.8125rem;
      font-weight: 600;
    }
  `]
})
export class WidgetIncidentSummaryComponent implements OnInit, OnDestroy {
  items: { label: string; value: number; color: string }[] = [];
  private sub?: Subscription;

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.sub = this.store.select(selectIncidentStats).subscribe((stats: any) => {
      if (!stats) return;
      this.items = [
        { label: 'Abiertos', value: stats.by_status?.abierto || 0, color: '#EF4444' },
        { label: 'En investigación', value: stats.by_status?.en_investigacion || 0, color: '#F59E0B' },
        { label: 'Contenidos', value: stats.by_status?.contenido || 0, color: '#3B82F6' },
        { label: 'Cerrados', value: stats.by_status?.cerrado || 0, color: '#10B981' },
        { label: 'Críticos', value: stats.by_severity?.critico || 0, color: '#7C3AED' },
      ];
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
