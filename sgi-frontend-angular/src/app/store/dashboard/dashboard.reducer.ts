import { createReducer, on } from '@ngrx/store';
import * as DashboardActions from './dashboard.actions';

export interface DashboardState {
  stats: any | null;
  kpis: any | null;
  trends: any | null;
  loading: boolean;
  error: string | null;
}

export const initialState: DashboardState = {
  stats: null,
  kpis: null,
  trends: null,
  loading: false,
  error: null,
};

export const dashboardReducer = createReducer(
  initialState,
  on(DashboardActions.loadDashboardStats, (state) => ({ ...state, loading: true })),
  on(DashboardActions.loadDashboardStatsSuccess, (state, { stats }) => ({
    ...state, stats, loading: false,
  })),
  on(DashboardActions.loadDashboardStatsFailure, (state, { error }) => ({
    ...state, error, loading: false,
  })),
  on(DashboardActions.loadDashboardKPIsSuccess, (state, { kpis }) => ({
    ...state, kpis,
  })),
  on(DashboardActions.loadDashboardTrendsSuccess, (state, { trends }) => ({
    ...state, trends,
  })),
);
