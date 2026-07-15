import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.reducer';
import { Observable, Subscription, map } from 'rxjs';
import { selectDashboardStats } from '../../../store/dashboard/dashboard.selectors';

@Component({
  selector: 'app-widget-stat-card',
  template: `
    <div class="stat-card" [style.borderLeftColor]="color">
      <div class="stat-icon" [style.background]="color + '20'" [style.color]="color">
        <span class="material-icons">{{ icon }}</span>
      </div>
      <div class="stat-info">
        <span class="stat-value">{{ value$ | async }}</span>
        <span class="stat-label">{{ title }}</span>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-left: 3px solid;
      height: 100%;
    }
    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon .material-icons { font-size: 1.25rem; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }
    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
  `]
})
export class WidgetStatCardComponent implements OnInit, OnDestroy {
  @Input() entity = '';
  @Input() title = '';
  @Input() icon = 'info';
  @Input() color = '#3B82F6';

  value$: Observable<number> = new Observable();
  private sub?: Subscription;

  private entityKeyMap: Record<string, string> = {
    processes: 'processes',
    assets: 'assets',
    documents: 'documents',
    risks: 'risks',
    controls: 'controls',
    incidents: 'incidents',
    audits: 'audits',
    courses: 'courses',
  };

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    const key = this.entityKeyMap[this.entity] || this.entity;
    this.value$ = this.store.select(selectDashboardStats).pipe(
      map((stats: any) => stats?.[key]?.count ?? 0)
    );
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
