import { createAction, props } from '@ngrx/store';
import { Risk } from '../../core/models';

export const loadRisks = createAction(
  '[Risks] Load',
  props<{ organizationId: string; page?: number; pageSize?: number; search?: string; category?: string; riskLevel?: string; status?: string }>()
);
export const loadRisksSuccess = createAction('[Risks] Load Success', props<{ risks: Risk[]; total: number }>());
export const loadRisksFailure = createAction('[Risks] Load Failure', props<{ error: string }>());
export const loadRiskMatrix = createAction('[Risks] Load Matrix', props<{ organizationId: string }>());
export const loadRiskMatrixSuccess = createAction('[Risks] Load Matrix Success', props<{ matrix: any }>());
export const loadRiskStats = createAction('[Risks] Load Stats', props<{ organizationId: string }>());
export const loadRiskStatsSuccess = createAction('[Risks] Load Stats Success', props<{ stats: any }>());
export const createRisk = createAction('[Risks] Create', props<{ data: Partial<Risk> }>());
export const createRiskSuccess = createAction('[Risks] Create Success', props<{ risk: Risk }>());
export const createRiskFailure = createAction('[Risks] Create Failure', props<{ error: string }>());
export const updateRisk = createAction('[Risks] Update', props<{ id: string; data: Partial<Risk> }>());
export const updateRiskSuccess = createAction('[Risks] Update Success', props<{ risk: Risk }>());
export const updateRiskFailure = createAction('[Risks] Update Failure', props<{ error: string }>());
export const deleteRisk = createAction('[Risks] Delete', props<{ id: string }>());
export const deleteRiskSuccess = createAction('[Risks] Delete Success', props<{ id: string }>());
export const deleteRiskFailure = createAction('[Risks] Delete Failure', props<{ error: string }>());
