import { createAction, props } from '@ngrx/store';
import { Asset } from '../../core/models';

export const loadAssets = createAction(
  '[Assets] Load',
  props<{
    organizationId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    assetType?: string;
    criticality?: string;
    status?: string;
  }>()
);

export const loadAssetsSuccess = createAction(
  '[Assets] Load Success',
  props<{ assets: Asset[]; total: number }>()
);

export const loadAssetsFailure = createAction(
  '[Assets] Load Failure',
  props<{ error: string }>()
);

export const loadAssetStats = createAction(
  '[Assets] Load Stats',
  props<{ organizationId: string }>()
);

export const loadAssetStatsSuccess = createAction(
  '[Assets] Load Stats Success',
  props<{ stats: AssetStats }>()
);

export const createAsset = createAction(
  '[Assets] Create',
  props<{ data: Partial<Asset> }>()
);

export const createAssetSuccess = createAction(
  '[Assets] Create Success',
  props<{ asset: Asset }>()
);

export const createAssetFailure = createAction(
  '[Assets] Create Failure',
  props<{ error: string }>()
);

export const updateAsset = createAction(
  '[Assets] Update',
  props<{ id: string; data: Partial<Asset> }>()
);

export const updateAssetSuccess = createAction(
  '[Assets] Update Success',
  props<{ asset: Asset }>()
);

export const updateAssetFailure = createAction(
  '[Assets] Update Failure',
  props<{ error: string }>()
);

export const deleteAsset = createAction(
  '[Assets] Delete',
  props<{ id: string }>()
);

export const deleteAssetSuccess = createAction(
  '[Assets] Delete Success',
  props<{ id: string }>()
);

export const deleteAssetFailure = createAction(
  '[Assets] Delete Failure',
  props<{ error: string }>()
);

export const setSelectedAsset = createAction(
  '[Assets] Set Selected',
  props<{ id: string | null }>()
);

export interface AssetStats {
  total: number;
  by_type: Record<string, number>;
  by_criticality: Record<string, number>;
  by_status: Record<string, number>;
  avg_cia: { confidentiality: number; integrity: number; availability: number };
}
