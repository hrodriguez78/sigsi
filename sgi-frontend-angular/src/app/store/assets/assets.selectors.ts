import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AssetsState } from './assets.reducer';

export const selectAssetsState = createFeatureSelector<AssetsState>('assets');

export const selectAssets = createSelector(selectAssetsState, (s) => s.assets);
export const selectSelectedAsset = createSelector(selectAssetsState, (s) => s.selected);
export const selectAssetStats = createSelector(selectAssetsState, (s) => s.stats);
export const selectAssetsTotal = createSelector(selectAssetsState, (s) => s.total);
export const selectAssetsLoading = createSelector(selectAssetsState, (s) => s.loading);
