import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ControlsState } from './controls.reducer';
export const selectControlsState = createFeatureSelector<ControlsState>('controls');
export const selectControls = createSelector(selectControlsState, s => s.controls);
export const selectControlStats = createSelector(selectControlsState, s => s.stats);
export const selectSoA = createSelector(selectControlsState, s => s.soa);
export const selectControlsLoading = createSelector(selectControlsState, s => s.loading);
export const selectControlsTotal = createSelector(selectControlsState, s => s.total);
