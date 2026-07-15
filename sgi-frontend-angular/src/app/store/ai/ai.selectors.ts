import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AIState } from './ai.reducer';

export const selectAIState = createFeatureSelector<AIState>('ai');
export const selectChatMessages = createSelector(selectAIState, (s) => s.chatMessages);
export const selectAILoading = createSelector(selectAIState, (s) => s.loading);
export const selectAISessions = createSelector(selectAIState, (s) => s.sessions);
export const selectPolicyResult = createSelector(selectAIState, (s) => s.policyResult);
export const selectGapResult = createSelector(selectAIState, (s) => s.gapResult);
export const selectRecommendations = createSelector(selectAIState, (s) => s.recommendations);
