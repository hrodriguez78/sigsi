import { createReducer, on } from '@ngrx/store';
import { Asset } from '../../core/models';
import * as AssetActions from './assets.actions';
import { AssetStats } from './assets.actions';

export interface AssetsState {
  assets: Asset[];
  selected: Asset | null;
  stats: AssetStats | null;
  total: number;
  page: number;
  pageSize: number;
  search: string;
  loading: boolean;
  error: string | null;
}

export const initialState: AssetsState = {
  assets: [],
  selected: null,
  stats: null,
  total: 0,
  page: 1,
  pageSize: 20,
  search: '',
  loading: false,
  error: null,
};

export const assetsReducer = createReducer(
  initialState,

  on(AssetActions.loadAssets, (state, { page, pageSize, search }) => ({
    ...state,
    page: page ?? state.page,
    pageSize: pageSize ?? state.pageSize,
    search: search ?? state.search,
    loading: true,
    error: null,
  })),

  on(AssetActions.loadAssetsSuccess, (state, { assets, total }) => ({
    ...state,
    assets,
    total,
    loading: false,
  })),

  on(AssetActions.loadAssetsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AssetActions.loadAssetStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
  })),

  on(AssetActions.createAssetSuccess, (state, { asset }) => ({
    ...state,
    assets: [asset, ...state.assets],
    total: state.total + 1,
  })),

  on(AssetActions.updateAssetSuccess, (state, { asset }) => ({
    ...state,
    assets: state.assets.map((a) => (a.id === asset.id ? asset : a)),
    selected: state.selected?.id === asset.id ? asset : state.selected,
  })),

  on(AssetActions.deleteAssetSuccess, (state, { id }) => ({
    ...state,
    assets: state.assets.filter((a) => a.id !== id),
    total: state.total - 1,
    selected: state.selected?.id === id ? null : state.selected,
  })),

  on(AssetActions.setSelectedAsset, (state, { id }) => ({
    ...state,
    selected: id ? state.assets.find((a) => a.id === id) || null : null,
  }))
);
