import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { WidgetService } from '../../core/services/widget.service';
import { ToastService } from '../../core/services/toast.service';
import * as WidgetsActions from './widgets.actions';

@Injectable()
export class WidgetsEffects {
  private actions$ = inject(Actions);
  private widgetService = inject(WidgetService);
  private toastService = inject(ToastService);

  loadLayout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WidgetsActions.loadLayout),
      mergeMap(() =>
        this.widgetService.getLayout().pipe(
          map((layout) => WidgetsActions.loadLayoutSuccess({ layout })),
          catchError((err) =>
            of(WidgetsActions.loadLayoutFailure({ error: err.message }))
          )
        )
      )
    )
  );

  updateLayout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WidgetsActions.updateLayout),
      mergeMap(({ layout }) =>
        this.widgetService.updateLayout(layout).pipe(
          map((updated) => WidgetsActions.updateLayoutSuccess({ layout: updated })),
          catchError((err) =>
            of(WidgetsActions.updateLayoutFailure({ error: err.message }))
          )
        )
      )
    )
  );

  updateLayoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(WidgetsActions.updateLayoutSuccess),
        tap(() => this.toastService.show('success', 'Layout guardado'))
      ),
    { dispatch: false }
  );

  resetLayout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WidgetsActions.resetLayout),
      mergeMap(() =>
        this.widgetService.resetLayout().pipe(
          map((layout) => WidgetsActions.resetLayoutSuccess({ layout })),
          catchError((err) =>
            of(WidgetsActions.updateLayoutFailure({ error: err.message }))
          )
        )
      )
    )
  );

  resetLayoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(WidgetsActions.resetLayoutSuccess),
        tap(() => this.toastService.show('success', 'Layout restablecido'))
      ),
    { dispatch: false }
  );
}
