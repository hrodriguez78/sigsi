import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AppState } from '../../store/app.reducer';
import { WidgetConfig } from '../../core/models';
import * as DashboardActions from '../../store/dashboard/dashboard.actions';
import * as WidgetsActions from '../../store/widgets/widgets.actions';
import {
  selectEnabledWidgets,
  selectLayout,
  selectGridColumns,
  selectWidgetsLoading,
} from '../../store/widgets/widgets.selectors';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  widgets$: Observable<WidgetConfig[]>;
  columns$: Observable<number>;
  layout$: Observable<any>;
  loading$: Observable<boolean>;
  settingsOpen = false;
  editMode = false;

  constructor(private store: Store<AppState>) {
    this.widgets$ = this.store.select(selectEnabledWidgets);
    this.columns$ = this.store.select(selectGridColumns);
    this.layout$ = this.store.select(selectLayout);
    this.loading$ = this.store.select(selectWidgetsLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(DashboardActions.loadDashboardStats());
    this.store.dispatch(DashboardActions.loadDashboardKPIs());
    this.store.dispatch(DashboardActions.loadDashboardTrends());
    this.store.dispatch(WidgetsActions.loadLayout());
  }

  onDrop(event: CdkDragDrop<WidgetConfig[]>): void {
    const currentWidgets = [...(this._currentWidgets || [])];
    moveItemInArray(currentWidgets, event.previousIndex, event.currentIndex);
    this.store.dispatch(WidgetsActions.reorderWidgets({ widgets: currentWidgets }));
    this.saveLayout();
  }

  toggleWidget(widgetId: string): void {
    this.store.dispatch(WidgetsActions.toggleWidget({ widgetId }));
    setTimeout(() => this.saveLayout(), 100);
  }

  setColumns(columns: number): void {
    this.store.dispatch(WidgetsActions.setColumns({ columns }));
    this.saveLayout();
  }

  resetLayout(): void {
    this.store.dispatch(WidgetsActions.resetLayout());
    this.settingsOpen = false;
  }

  toggleSettings(): void {
    this.settingsOpen = !this.settingsOpen;
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  getGridClass(columns: number): string {
    const map: Record<number, string> = { 2: 'grid-2', 3: 'grid-3', 4: 'grid-4' };
    return map[columns] || 'grid-4';
  }

  getWidgetSpan(widget: WidgetConfig): string {
    if (widget.size === 'large') return 'span-2';
    if (widget.size === 'small') return '';
    return '';
  }

  trackByWidgetId(index: number, widget: WidgetConfig): string {
    return widget.id;
  }

  private _currentWidgets: WidgetConfig[] = [];

  setWidgets(widgets: WidgetConfig[]): void {
    this._currentWidgets = widgets;
  }

  private saveLayout(): void {
    this.store.select(selectLayout).pipe(
      map(layout => layout ? { widgets: layout.widgets, columns: layout.columns } : null)
    ).subscribe(partial => {
      if (partial) {
        this.store.dispatch(WidgetsActions.updateLayout({ layout: partial }));
      }
    }).unsubscribe();
  }
}
