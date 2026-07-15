import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Process } from '../../core/models';
import * as ProcActions from './processes.actions';

@Injectable()
export class ProcessesEffects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProcActions.loadProcesses),
      mergeMap(({ organizationId, page, pageSize, search, processType, status }) => {
        const params = new URLSearchParams();
        params.set('organization_id', organizationId);
        params.set('page', String(page || 1));
        params.set('page_size', String(pageSize || 20));
        if (search) params.set('search', search);
        if (processType) params.set('process_type', processType);
        if (status) params.set('status', status);
        return this.api.get<any>(`/processes?${params.toString()}`).pipe(
          map((res) =>
            ProcActions.loadProcessesSuccess({
              processes: res.processes,
              total: res.total,
            })
          ),
          catchError((err) =>
            of(ProcActions.loadProcessesFailure({ error: err.error?.detail || 'Error' }))
          )
        );
      })
    )
  );

  loadTree$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProcActions.loadProcessTree),
      mergeMap(({ organizationId }) =>
        this.api
          .get<any>(`/processes/tree?organization_id=${organizationId}`)
          .pipe(
            map((res) => ProcActions.loadProcessTreeSuccess({ tree: res.tree })),
            catchError((err) =>
              of(ProcActions.loadProcessesFailure({ error: err.error?.detail || 'Error' }))
            )
          )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProcActions.createProcess),
      mergeMap(({ data }) =>
        this.api.post<Process>('/processes', data).pipe(
          map((process) => {
            this.toast.success('Proceso creado');
            return ProcActions.createProcessSuccess({ process });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al crear');
            return of(ProcActions.createProcessFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProcActions.updateProcess),
      mergeMap(({ id, data }) =>
        this.api.put<Process>(`/processes/${id}`, data).pipe(
          map((process) => {
            this.toast.success('Proceso actualizado');
            return ProcActions.updateProcessSuccess({ process });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al actualizar');
            return of(ProcActions.updateProcessFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProcActions.deleteProcess),
      mergeMap(({ id }) =>
        this.api.delete(`/processes/${id}`).pipe(
          map(() => {
            this.toast.success('Proceso eliminado');
            return ProcActions.deleteProcessSuccess({ id });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al eliminar');
            return of(ProcActions.deleteProcessFailure({ error: err.error?.detail }));
          })
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
