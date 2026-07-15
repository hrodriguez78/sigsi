import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { OrgchartService } from '../../core/services/orgchart.service';
import { ToastService } from '../../core/services/toast.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.reducer';
import * as OrgChartActions from './orgchart.actions';

@Injectable()
export class OrgChartEffects {
  private actions$ = inject(Actions);
  private orgchartService = inject(OrgchartService);
  private toastService = inject(ToastService);
  private store = inject(Store<AppState>);

  loadTree$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrgChartActions.loadOrgChart),
      mergeMap(({ organizationId }) =>
        this.orgchartService.getTree(organizationId).pipe(
          map((res) => OrgChartActions.loadOrgChartSuccess({ tree: res.tree, positions: res.positions })),
          catchError((err) => of(OrgChartActions.loadOrgChartFailure({ error: err.message })))
        )
      )
    )
  );

  createPosition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrgChartActions.createPosition),
      mergeMap(({ organizationId, data }) =>
        this.orgchartService.createPosition(organizationId, data).pipe(
          map((position) => OrgChartActions.createPositionSuccess({ position })),
          catchError((err) => of(OrgChartActions.loadOrgChartFailure({ error: err.message })))
        )
      )
    )
  );

  updatePosition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrgChartActions.updatePosition),
      mergeMap(({ id, data }) =>
        this.orgchartService.updatePosition(id, data).pipe(
          map((position) => OrgChartActions.updatePositionSuccess({ position })),
          catchError((err) => of(OrgChartActions.loadOrgChartFailure({ error: err.message })))
        )
      )
    )
  );

  deletePosition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrgChartActions.deletePosition),
      mergeMap(({ id }) =>
        this.orgchartService.deletePosition(id).pipe(
          map(() => OrgChartActions.deletePositionSuccess({ id })),
          catchError((err) => of(OrgChartActions.loadOrgChartFailure({ error: err.message })))
        )
      )
    )
  );

  reloadAfterMutation$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          OrgChartActions.createPositionSuccess,
          OrgChartActions.deletePositionSuccess
        ),
        tap(() => this.toastService.show('success', 'Organigrama actualizado'))
      ),
    { dispatch: false }
  );
}
