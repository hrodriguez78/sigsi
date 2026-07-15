import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Incident } from '../../core/models';
import * as A from './incidents.actions';
@Injectable()
export class IncidentsEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadIncidents),
    mergeMap(({ organizationId, page, pageSize, search, severity, status }) => {
      const p = new URLSearchParams();
      p.set('organization_id', organizationId); p.set('page', String(page || 1)); p.set('page_size', String(pageSize || 20));
      if (search) p.set('search', search); if (severity) p.set('severity', severity); if (status) p.set('status', status);
      return this.api.get<any>(`/incidents?${p.toString()}`).pipe(map(r => A.loadIncidentsSuccess({ incidents: r.incidents, total: r.total })), catchError(e => of(A.loadIncidentsFailure({ error: e.error?.detail }))));
    })
  ));
  stats$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadIncidentStats),
    mergeMap(({ organizationId }) => this.api.get<any>(`/incidents/stats?organization_id=${organizationId}`).pipe(map(stats => A.loadIncidentStatsSuccess({ stats })), catchError(() => of({ type: 'NOOP' }))))
  ));
  create$ = createEffect(() => this.actions$.pipe(
    ofType(A.createIncident),
    mergeMap(({ data }) => this.api.post<Incident>('/incidents', data).pipe(map(i => { this.toast.success('Incidente creado'); return A.createIncidentSuccess({ incident: i }); }), catchError(e => { this.toast.error(e.error?.detail); return of(A.createIncidentFailure({ error: e.error?.detail })); })))
  ));
  update$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateIncident),
    mergeMap(({ id, data }) => this.api.put<Incident>(`/incidents/${id}`, data).pipe(map(i => { this.toast.success('Incidente actualizado'); return A.updateIncidentSuccess({ incident: i }); }), catchError(e => { this.toast.error(e.error?.detail); return of(A.updateIncidentFailure({ error: e.error?.detail })); })))
  ));
  delete$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteIncident),
    mergeMap(({ id }) => this.api.delete(`/incidents/${id}`).pipe(map(() => { this.toast.success('Incidente eliminado'); return A.deleteIncidentSuccess({ id }); }), catchError(e => { this.toast.error(e.error?.detail); return of({ type: 'NOOP' }); })))
  ));
  constructor(private actions$: Actions, private api: ApiService, private toast: ToastService) {}
}
