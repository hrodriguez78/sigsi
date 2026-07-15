import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RisksState } from './risks.reducer';
export const selectRisksState = createFeatureSelector<RisksState>('risks');
export const selectRisks = createSelector(selectRisksState, s => s.risks);
export const selectRiskMatrix = createSelector(selectRisksState, s => s.matrix);
export const selectRiskStats = createSelector(selectRisksState, s => s.stats);
export const selectRisksTotal = createSelector(selectRisksState, s => s.total);
export const selectRisksLoading = createSelector(selectRisksState, s => s.loading);
