import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState } from './dashboard.reducer';

export const selectDashboardState = createFeatureSelector<DashboardState>('dashboard');
export const selectDashboardStats = createSelector(selectDashboardState, (s) => s.stats);
export const selectDashboardKPIs = createSelector(selectDashboardState, (s) => s.kpis);
export const selectDashboardTrends = createSelector(selectDashboardState, (s) => s.trends);
export const selectDashboardLoading = createSelector(selectDashboardState, (s) => s.loading);
