import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuditsState } from './audits.reducer';

export const selectAuditsState = createFeatureSelector<AuditsState>('audits');

export const selectAllAudits = createSelector(selectAuditsState, s => s.audits);
export const selectAuditsLoading = createSelector(selectAuditsState, s => s.loading);
export const selectAuditsTotal = createSelector(selectAuditsState, s => s.total);
export const selectAuditStats = createSelector(selectAuditsState, s => s.stats);
export const selectCurrentAudit = createSelector(selectAuditsState, s => s.currentAudit);
export const selectDetailLoading = createSelector(selectAuditsState, s => s.detailLoading);
export const selectAuditFindings = createSelector(selectAuditsState, s => s.findings);
export const selectAuditChecklist = createSelector(selectAuditsState, s => s.checklist);
export const selectAuditCorrectiveActions = createSelector(selectAuditsState, s => s.correctiveActions);
