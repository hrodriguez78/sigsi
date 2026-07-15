import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import * as CandActions from './candidates.actions';

@Injectable()
export class CandidatesEffects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.loadCandidates),
      mergeMap(({ organizationId, page, pageSize, search, status, processId }) => {
        const params = new URLSearchParams();
        if (organizationId) params.set('organization_id', organizationId);
        params.set('page', String(page || 1));
        params.set('page_size', String(pageSize || 20));
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        if (processId) params.set('process_id', processId);
        return this.api.get<any>(`/candidates?${params.toString()}`).pipe(
          map((res) => CandActions.loadCandidatesSuccess({ candidates: res.candidates, total: res.total })),
          catchError((err) => of(CandActions.loadCandidatesFailure({ error: err.error?.detail || 'Error' })))
        );
      })
    )
  );

  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.loadPipelineStats),
      mergeMap(({ organizationId }) =>
        this.api.get<any>(`/candidates/pipeline-stats?organization_id=${organizationId}`).pipe(
          map((res) => CandActions.loadPipelineStatsSuccess({ stats: res })),
          catchError(() => of(CandActions.loadPipelineStatsSuccess({
            stats: { total: 0, new: 0, in_review: 0, approved: 0, rejected: 0, hired: 0, withdrawn: 0, avg_score: 0 }
          })))
        )
      )
    )
  );

  loadOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.loadCandidate),
      mergeMap(({ id }) =>
        this.api.get<any>(`/candidates/${id}`).pipe(
          map((res) => CandActions.loadCandidateSuccess({ candidate: res })),
          catchError((err) => of(CandActions.loadCandidatesFailure({ error: err.error?.detail || 'Error' })))
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.createCandidate),
      mergeMap(({ data }) =>
        this.api.post<any>('/candidates', data).pipe(
          map((res) => {
            this.toast.success('Candidato registrado');
            return CandActions.createCandidateSuccess({ candidate: res });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al registrar');
            return of(CandActions.loadCandidatesFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.updateCandidate),
      mergeMap(({ id, data }) =>
        this.api.put<any>(`/candidates/${id}`, data).pipe(
          map((res) => {
            this.toast.success('Candidato actualizado');
            return CandActions.updateCandidateSuccess({ candidate: res });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al actualizar');
            return of(CandActions.loadCandidatesFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.deleteCandidate),
      mergeMap(({ id }) =>
        this.api.delete(`/candidates/${id}`).pipe(
          map(() => {
            this.toast.success('Candidato eliminado');
            return CandActions.deleteCandidateSuccess({ id });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al eliminar');
            return of(CandActions.loadCandidatesFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  loadDocs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.loadDocuments),
      mergeMap(({ candidateId }) =>
        this.api.get<any[]>(`/candidates/${candidateId}/documents`).pipe(
          map((res) => CandActions.loadDocumentsSuccess({ documents: res })),
          catchError(() => of(CandActions.loadDocumentsSuccess({ documents: [] })))
        )
      )
    )
  );

  addDoc$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.addDocument),
      mergeMap(({ candidateId, data }) =>
        this.api.post<any>(`/candidates/${candidateId}/documents`, data).pipe(
          map((res) => {
            this.toast.success('Documento adjuntado');
            return CandActions.addDocumentSuccess({ document: res });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error');
            return of(CandActions.loadDocumentsSuccess({ documents: [] }));
          })
        )
      )
    )
  );

  verifyDoc$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.verifyDocument),
      mergeMap(({ docId }) =>
        this.api.put<any>(`/candidates/documents/${docId}/verify`, {}).pipe(
          map((res) => {
            this.toast.success('Documento verificado');
            return CandActions.verifyDocumentSuccess({ document: res });
          }),
          catchError(() => of(CandActions.loadDocumentsSuccess({ documents: [] })))
        )
      )
    )
  );

  loadTests$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.loadTests),
      mergeMap(({ candidateId }) =>
        this.api.get<any[]>(`/candidates/${candidateId}/tests`).pipe(
          map((res) => CandActions.loadTestsSuccess({ tests: res })),
          catchError(() => of(CandActions.loadTestsSuccess({ tests: [] })))
        )
      )
    )
  );

  addTest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.addTest),
      mergeMap(({ candidateId, data }) =>
        this.api.post<any>(`/candidates/${candidateId}/tests`, data).pipe(
          map((res) => {
            this.toast.success('Prueba agregada');
            return CandActions.addTestSuccess({ test: res });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error');
            return of(CandActions.loadTestsSuccess({ tests: [] }));
          })
        )
      )
    )
  );

  updateTest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.updateTest),
      mergeMap(({ testId, data }) =>
        this.api.put<any>(`/candidates/tests/${testId}`, data).pipe(
          map((res) => {
            this.toast.success('Prueba actualizada');
            return CandActions.updateTestSuccess({ test: res });
          }),
          catchError(() => of(CandActions.loadTestsSuccess({ tests: [] })))
        )
      )
    )
  );

  loadActs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.loadActivities),
      mergeMap(({ candidateId }) =>
        this.api.get<any[]>(`/candidates/${candidateId}/activities`).pipe(
          map((res) => CandActions.loadActivitiesSuccess({ activities: res })),
          catchError(() => of(CandActions.loadActivitiesSuccess({ activities: [] })))
        )
      )
    )
  );

  addAct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CandActions.addActivity),
      mergeMap(({ candidateId, data }) =>
        this.api.post<any>(`/candidates/${candidateId}/activities`, data).pipe(
          map((res) => {
            this.toast.success('Actividad registrada');
            return CandActions.addActivitySuccess({ activity: res });
          }),
          catchError(() => of(CandActions.loadActivitiesSuccess({ activities: [] })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private toast: ToastService
  ) {}
}
