import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Audit, AuditFinding, AuditCorrectiveAction, AuditChecklistItem } from '../../core/models';
import * as A from './audits.actions';

@Injectable()
export class AuditsEffects {
  load$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadAudits),
    mergeMap(({ organizationId, page, pageSize, search, auditType, status }) => {
      const p = new URLSearchParams();
      p.set('organization_id', organizationId);
      p.set('page', String(page || 1));
      p.set('page_size', String(pageSize || 20));
      if (search) p.set('search', search);
      if (auditType) p.set('audit_type', auditType);
      if (status) p.set('status', status);
      return this.api.get<any>(`/audits?${p.toString()}`).pipe(
        map(r => A.loadAuditsSuccess({ audits: r.audits, total: r.total })),
        catchError(e => of(A.loadAuditsFailure({ error: e.error?.detail })))
      );
    })
  ));

  loadById$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadAuditById),
    mergeMap(({ id }) => this.api.get<Audit>(`/audits/${id}`).pipe(
      map(audit => A.loadAuditByIdSuccess({ audit })),
      catchError(e => of(A.loadAuditByIdFailure({ error: e.error?.detail })))
    ))
  ));

  stats$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadAuditStats),
    mergeMap(({ organizationId }) => this.api.get<any>(`/audits/stats?organization_id=${organizationId}`).pipe(
      map(stats => A.loadAuditStatsSuccess({ stats })),
      catchError(() => of({ type: 'NOOP' }))
    ))
  ));

  create$ = createEffect(() => this.actions$.pipe(
    ofType(A.createAudit),
    mergeMap(({ data }) => this.api.post<Audit>('/audits', data).pipe(
      map(a => {
        this.toast.success('Auditoría creada');
        return A.createAuditSuccess({ audit: a });
      }),
      catchError(e => {
        this.toast.error(e.error?.detail);
        return of(A.createAuditFailure({ error: e.error?.detail }));
      })
    ))
  ));

  update$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateAudit),
    mergeMap(({ id, data }) => this.api.put<Audit>(`/audits/${id}`, data).pipe(
      map(a => {
        this.toast.success('Auditoría actualizada');
        return A.updateAuditSuccess({ audit: a });
      }),
      catchError(e => {
        this.toast.error(e.error?.detail);
        return of(A.updateAuditFailure({ error: e.error?.detail }));
      })
    ))
  ));

  delete$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteAudit),
    mergeMap(({ id }) => this.api.delete(`/audits/${id}`).pipe(
      map(() => {
        this.toast.success('Auditoría eliminada');
        return A.deleteAuditSuccess({ id });
      }),
      catchError(e => {
        this.toast.error(e.error?.detail);
        return of({ type: 'NOOP' });
      })
    ))
  ));

  loadFindings$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadAuditFindings),
    mergeMap(({ auditId }) => this.api.get<AuditFinding[]>(`/audits/${auditId}/findings`).pipe(
      map(findings => A.loadAuditFindingsSuccess({ findings })),
      catchError(e => of(A.loadAuditFindingsFailure({ error: e.error?.detail })))
    ))
  ));

  addFinding$ = createEffect(() => this.actions$.pipe(
    ofType(A.addAuditFinding),
    mergeMap(({ auditId, data }) => this.api.post<AuditFinding>(`/audits/${auditId}/findings`, data).pipe(
      map(finding => {
        this.toast.success('Hallazgo registrado');
        return A.addAuditFindingSuccess({ finding });
      }),
      catchError(e => {
        this.toast.error(e.error?.detail);
        return of(A.addAuditFindingFailure({ error: e.error?.detail }));
      })
    ))
  ));

  loadChecklist$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadAuditChecklist),
    mergeMap(({ auditId }) => this.api.get<AuditChecklistItem[]>(`/audits/${auditId}/checklist`).pipe(
      map(checklist => A.loadAuditChecklistSuccess({ checklist })),
      catchError(e => of(A.loadAuditChecklistFailure({ error: e.error?.detail })))
    ))
  ));

  addChecklistItem$ = createEffect(() => this.actions$.pipe(
    ofType(A.addAuditChecklistItem),
    mergeMap(({ auditId, data }) => this.api.post<AuditChecklistItem>(`/audits/${auditId}/checklist`, data).pipe(
      map(item => {
        this.toast.success('Ítem de checklist agregado');
        return A.addAuditChecklistItemSuccess({ item });
      }),
      catchError(e => {
        this.toast.error(e.error?.detail);
        return of(A.addAuditChecklistItemFailure({ error: e.error?.detail }));
      })
    ))
  ));

  loadCorrectiveActions$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadAuditCorrectiveActions),
    mergeMap(({ auditId }) => this.api.get<AuditCorrectiveAction[]>(`/audits/${auditId}/corrective-actions`).pipe(
      map(actions => A.loadAuditCorrectiveActionsSuccess({ actions })),
      catchError(e => of(A.loadAuditCorrectiveActionsFailure({ error: e.error?.detail })))
    ))
  ));

  addCorrectiveAction$ = createEffect(() => this.actions$.pipe(
    ofType(A.addAuditCorrectiveAction),
    mergeMap(({ auditId, data }) => this.api.post<AuditCorrectiveAction>(`/audits/${auditId}/corrective-actions`, data).pipe(
      map(correctiveAction => {
        this.toast.success('Acción correctiva registrada');
        return A.addAuditCorrectiveActionSuccess({ correctiveAction });
      }),
      catchError(e => {
        this.toast.error(e.error?.detail);
        return of(A.addAuditCorrectiveActionFailure({ error: e.error?.detail }));
      })
    ))
  ));

  updateCorrectiveAction$ = createEffect(() => this.actions$.pipe(
    ofType(A.updateAuditCorrectiveAction),
    mergeMap(({ id, data }) => this.api.put<AuditCorrectiveAction>(`/audits/corrective-actions/${id}`, data).pipe(
      map(correctiveAction => {
        this.toast.success('Acción correctiva actualizada');
        return A.updateAuditCorrectiveActionSuccess({ correctiveAction });
      }),
      catchError(e => {
        this.toast.error(e.error?.detail);
        return of(A.updateAuditCorrectiveActionFailure({ error: e.error?.detail }));
      })
    ))
  ));

  constructor(private actions$: Actions, private api: ApiService, private toast: ToastService) {}
}
