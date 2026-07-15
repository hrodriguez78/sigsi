import { createAction, props } from '@ngrx/store';

export const loadDashboardStats = createAction('[Dashboard] Load Stats');
export const loadDashboardStatsSuccess = createAction(
  '[Dashboard] Load Stats Success',
  props<{ stats: any }>()
);
export const loadDashboardStatsFailure = createAction(
  '[Dashboard] Load Stats Failure',
  props<{ error: string }>()
);

export const loadDashboardKPIs = createAction('[Dashboard] Load KPIs');
export const loadDashboardKPIsSuccess = createAction(
  '[Dashboard] Load KPIs Success',
  props<{ kpis: any }>()
);

export const loadDashboardTrends = createAction('[Dashboard] Load Trends');
export const loadDashboardTrendsSuccess = createAction(
  '[Dashboard] Load Trends Success',
  props<{ trends: any }>()
);
