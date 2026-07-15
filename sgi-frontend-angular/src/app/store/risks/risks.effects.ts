import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Risk } from '../../core/models';
import * as A from './risks.actions';

@Injectable()
export class RisksEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadRisks),
    mergeMap(({ organizationId, page, pageSize, search, category, riskLevel, status }) => {
      const p = new URLSearchParams();
      p.set('organization_id', organizationId);
      p.set('page', String(page || 1));
      p.set('page_size', String(pageSize || 20));
      if (search) p.set('search', search);
      if (category) p.set('category', category);
      if (riskLevel) p.set('risk_level', riskLevel);
      if (status) p.set('status', status);
      return this.api.get<any>(`/risks?${p.toString()}`).pipe(
        map(res => A.loadRisksSuccess({ risks: res.risks, total: res.total })),
        catchError(err => of(A.loadRisksFailure({ error: err.error?.detail })))
      );
    })
  ));

  matrix$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadRiskMatrix),
    mergeMap(({ organizationId }) =>
      this.api.get<any>(`/risks/matrix?organization_id=${organizationId}`).pipe(
        map(matrix => A.loadRiskMatrixSuccess({ matrix })),
        catchError(() => of({ type: 'NOOP' }))
      )
    )
  ));

  stats$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadRiskStats),
    mergeMap(({ organizationId }) =>
      this.api.get<any>(`/risks/stats?organization_id=${organizationId}`).pipe(
        map(stats => A.loadRiskStatsSuccess({ stats })),
        catchError(() => of({ type: 'NOOP' }))
      )
    )
  ));

  create$ = createEffect(() => this.actions$.pipe(
    ofType(A.createRisk),
    mergeMap(({ data }) => this.api.post<Risk>('/risks', data).pipe(
      map(risk => { this.toast.success('Riesgo creado'); return A.createRiskSuccess({ risk }); }),
      catchError(err => { this.toast.error(err.error?.detail); return of(A.createRiskFailure({ error: err.error?.detail })); })
    ))
  ));

  update$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateRisk),
    mergeMap(({ id, data }) => this.api.put<Risk>(`/risks/${id}`, data).pipe(
      map(risk => { this.toast.success('Riesgo actualizado'); return A.updateRiskSuccess({ risk }); }),
      catchError(err => { this.toast.error(err.error?.detail); return of(A.updateRiskFailure({ error: err.error?.detail })); })
    ))
  ));

  delete$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteRisk),
    mergeMap(({ id }) => this.api.delete(`/risks/${id}`).pipe(
      map(() => { this.toast.success('Riesgo eliminado'); return A.deleteRiskSuccess({ id }); }),
      catchError(err => { this.toast.error(err.error?.detail); return of(A.deleteRiskFailure({ error: err.error?.detail })); })
    ))
  ));

  constructor(private actions$: Actions, private api: ApiService, private toast: ToastService) {}
}
