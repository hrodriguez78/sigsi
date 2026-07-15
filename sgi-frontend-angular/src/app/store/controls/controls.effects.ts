import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Control } from '../../core/models';
import * as A from './controls.actions';
@Injectable()
export class ControlsEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadControls),
    mergeMap(({ organizationId, page, pageSize, search, category, implementationStatus }) => {
      const p = new URLSearchParams();
      p.set('organization_id', organizationId); p.set('page', String(page || 1)); p.set('page_size', String(pageSize || 20));
      if (search) p.set('search', search); if (category) p.set('category', category); if (implementationStatus) p.set('implementation_status', implementationStatus);
      return this.api.get<any>(`/controls?${p.toString()}`).pipe(map(r => A.loadControlsSuccess({ controls: r.controls, total: r.total })), catchError(e => of(A.loadControlsFailure({ error: e.error?.detail }))));
    })
  ));
  stats$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadControlStats),
    mergeMap(({ organizationId }) => this.api.get<any>(`/controls/stats?organization_id=${organizationId}`).pipe(map(stats => A.loadControlStatsSuccess({ stats })), catchError(() => of({ type: 'NOOP' }))))
  ));
  soa$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadSoA),
    mergeMap(({ organizationId }) => this.api.get<any>(`/controls/soa?organization_id=${organizationId}`).pipe(map(soa => A.loadSoASuccess({ soa })), catchError(() => of({ type: 'NOOP' }))))
  ));
  create$ = createEffect(() => this.actions$.pipe(
    ofType(A.createControl),
    mergeMap(({ data }) => this.api.post<Control>('/controls', data).pipe(map(c => { this.toast.success('Control creado'); return A.createControlSuccess({ control: c }); }), catchError(e => { this.toast.error(e.error?.detail); return of(A.createControlFailure({ error: e.error?.detail })); })))
  ));
  update$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateControl),
    mergeMap(({ id, data }) => this.api.put<Control>(`/controls/${id}`, data).pipe(map(c => { this.toast.success('Control actualizado'); return A.updateControlSuccess({ control: c }); }), catchError(e => { this.toast.error(e.error?.detail); return of(A.updateControlFailure({ error: e.error?.detail })); })))
  ));
  delete$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteControl),
    mergeMap(({ id }) => this.api.delete(`/controls/${id}`).pipe(map(() => { this.toast.success('Control eliminado'); return A.deleteControlSuccess({ id }); }), catchError(e => { this.toast.error(e.error?.detail); return of({ type: 'NOOP' }); })))
  ));
  constructor(private actions$: Actions, private api: ApiService, private toast: ToastService) {}
}
