import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Asset } from '../../core/models';
import * as AssetActions from './assets.actions';

@Injectable()
export class AssetsEffects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssetActions.loadAssets),
      mergeMap(({ organizationId, page, pageSize, search, assetType, criticality, status }) => {
        const params = new URLSearchParams();
        params.set('organization_id', organizationId);
        params.set('page', String(page || 1));
        params.set('page_size', String(pageSize || 20));
        if (search) params.set('search', search);
        if (assetType) params.set('asset_type', assetType);
        if (criticality) params.set('criticality', criticality);
        if (status) params.set('status', status);
        return this.api.get<any>(`/assets?${params.toString()}`).pipe(
          map((res) =>
            AssetActions.loadAssetsSuccess({ assets: res.assets, total: res.total })
          ),
          catchError((err) =>
            of(AssetActions.loadAssetsFailure({ error: err.error?.detail || 'Error' }))
          )
        );
      })
    )
  );

  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssetActions.loadAssetStats),
      mergeMap(({ organizationId }) =>
        this.api
          .get<any>(`/assets/stats?organization_id=${organizationId}`)
          .pipe(
            map((stats) => AssetActions.loadAssetStatsSuccess({ stats })),
            catchError(() => of({ type: 'NOOP' }))
          )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssetActions.createAsset),
      mergeMap(({ data }) =>
        this.api.post<Asset>('/assets', data).pipe(
          map((asset) => {
            this.toast.success('Activo creado');
            return AssetActions.createAssetSuccess({ asset });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al crear');
            return of(AssetActions.createAssetFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssetActions.updateAsset),
      mergeMap(({ id, data }) =>
        this.api.put<Asset>(`/assets/${id}`, data).pipe(
          map((asset) => {
            this.toast.success('Activo actualizado');
            return AssetActions.updateAssetSuccess({ asset });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al actualizar');
            return of(AssetActions.updateAssetFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AssetActions.deleteAsset),
      mergeMap(({ id }) =>
        this.api.delete(`/assets/${id}`).pipe(
          map(() => {
            this.toast.success('Activo eliminado');
            return AssetActions.deleteAssetSuccess({ id });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al eliminar');
            return of(AssetActions.deleteAssetFailure({ error: err.error?.detail }));
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
