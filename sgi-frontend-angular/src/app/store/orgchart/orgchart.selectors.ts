import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrgChartState } from './orgchart.reducer';

export const selectOrgChartState = createFeatureSelector<OrgChartState>('orgchart');

export const selectOrgTree = createSelector(selectOrgChartState, (s) => s.tree);
export const selectOrgPositions = createSelector(selectOrgChartState, (s) => s.positions);
export const selectOrgChartLoading = createSelector(selectOrgChartState, (s) => s.loading);
export const selectOrgChartError = createSelector(selectOrgChartState, (s) => s.error);
export const selectSelectedPositionId = createSelector(selectOrgChartState, (s) => s.selectedPositionId);

export const selectSelectedPosition = createSelector(
  selectOrgPositions,
  selectSelectedPositionId,
  (positions, id) => positions.find((p) => p.id === id) || null
);
