import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CandidatesState } from './candidates.reducer';

export const selectCandidatesState = createFeatureSelector<CandidatesState>('candidates');

export const selectCandidates = createSelector(selectCandidatesState, s => s.candidates);
export const selectSelectedCandidate = createSelector(selectCandidatesState, s => s.selected);
export const selectCandidatesTotal = createSelector(selectCandidatesState, s => s.total);
export const selectCandidatesLoading = createSelector(selectCandidatesState, s => s.loading);
export const selectPipelineStats = createSelector(selectCandidatesState, s => s.pipelineStats);
export const selectDocuments = createSelector(selectCandidatesState, s => s.documents);
export const selectTests = createSelector(selectCandidatesState, s => s.tests);
export const selectActivities = createSelector(selectCandidatesState, s => s.activities);
