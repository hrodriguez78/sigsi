import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { RaciMatrix } from '../../core/models';
import * as RaciActions from './raci.actions';

@Injectable()
export class RaciEffects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RaciActions.loadRaciMatrices),
      mergeMap(({ organizationId, page, pageSize, search }) => {
        const params = new URLSearchParams();
        if (organizationId) params.set('organization_id', organizationId);
        params.set('page', String(page || 1));
        params.set('page_size', String(pageSize || 20));
        if (search) params.set('search', search);
        return this.api.get<any>(`/raci?${params.toString()}`).pipe(
          map((res) =>
            RaciActions.loadRaciMatricesSuccess({
              matrices: res.matrices,
              total: res.total,
            })
          ),
          catchError((err) =>
            of(RaciActions.loadRaciMatricesFailure({ error: err.error?.detail || 'Error' }))
          )
        );
      })
    )
  );

  loadById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RaciActions.loadRaciMatrixById),
      mergeMap(({ id }) =>
        this.api.get<RaciMatrix>(`/raci/${id}`).pipe(
          map((matrix) => RaciActions.loadRaciMatrixByIdSuccess({ matrix })),
          catchError((err) =>
            of(RaciActions.loadRaciMatricesFailure({ error: err.error?.detail || 'Error' }))
          )
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RaciActions.createRaciMatrix),
      mergeMap(({ data }) =>
        this.api.post<RaciMatrix>('/raci', data).pipe(
          map((matrix) => {
            this.toast.success('Matriz RACI creada');
            return RaciActions.createRaciMatrixSuccess({ matrix });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al crear');
            return of(RaciActions.loadRaciMatricesFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RaciActions.updateRaciMatrix),
      mergeMap(({ id, data }) =>
        this.api.put<RaciMatrix>(`/raci/${id}`, data).pipe(
          map((matrix) => {
            this.toast.success('Matriz RACI actualizada');
            return RaciActions.updateRaciMatrixSuccess({ matrix });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al actualizar');
            return of(RaciActions.loadRaciMatricesFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RaciActions.deleteRaciMatrix),
      mergeMap(({ id }) =>
        this.api.delete(`/raci/${id}`).pipe(
          map(() => {
            this.toast.success('Matriz RACI eliminada');
            return RaciActions.deleteRaciMatrixSuccess({ id });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al eliminar');
            return of(RaciActions.loadRaciMatricesFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private toast: ToastService,
  ) {}
}
