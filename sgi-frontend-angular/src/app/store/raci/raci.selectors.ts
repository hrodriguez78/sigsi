import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RaciState } from './raci.reducer';

export const selectRaciState = createFeatureSelector<RaciState>('raci');

export const selectRaciMatrices = createSelector(selectRaciState, (s) => s.matrices);
export const selectRaciSelected = createSelector(selectRaciState, (s) => s.selected);
export const selectRaciTotal = createSelector(selectRaciState, (s) => s.total);
export const selectRaciLoading = createSelector(selectRaciState, (s) => s.loading);
