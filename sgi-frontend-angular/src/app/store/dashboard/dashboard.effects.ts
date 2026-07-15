import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as DashboardActions from './dashboard.actions';

@Injectable()
export class DashboardEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboardStats),
      switchMap(() =>
        this.http.get<any>('/api/v1/dashboard/stats').pipe(
          map((stats) => DashboardActions.loadDashboardStatsSuccess({ stats })),
          catchError((err) => of(DashboardActions.loadDashboardStatsFailure({ error: err.error?.detail || 'Error' })))
        )
      )
    )
  );

  loadKPIs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboardKPIs),
      switchMap(() =>
        this.http.get<any>('/api/v1/dashboard/kpis').pipe(
          map((kpis) => DashboardActions.loadDashboardKPIsSuccess({ kpis })),
          catchError(() => of())
        )
      )
    )
  );

  loadTrends$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboardTrends),
      switchMap(() =>
        this.http.get<any>('/api/v1/dashboard/trends').pipe(
          map((trends) => DashboardActions.loadDashboardTrendsSuccess({ trends })),
          catchError(() => of())
        )
      )
    )
  );
}
