import { createAction, props } from '@ngrx/store';

export const sendChatMessage = createAction(
  '[AI] Send Chat Message',
  props<{ message: string; sessionId?: string }>()
);
export const sendChatMessageSuccess = createAction(
  '[AI] Send Chat Message Success',
  props<{ sessionId: string; message: string }>()
);
export const sendChatMessageFailure = createAction(
  '[AI] Send Chat Message Failure',
  props<{ error: string }>()
);

export const loadSessions = createAction('[AI] Load Sessions');
export const loadSessionsSuccess = createAction(
  '[AI] Load Sessions Success',
  props<{ sessions: any[] }>()
);

export const loadSession = createAction(
  '[AI] Load Session',
  props<{ sessionId: string }>()
);
export const loadSessionSuccess = createAction(
  '[AI] Load Session Success',
  props<{ session: any }>()
);

export const deleteSession = createAction(
  '[AI] Delete Session',
  props<{ sessionId: string }>()
);

export const generatePolicy = createAction(
  '[AI] Generate Policy',
  props<{ policyType: string; title: string; scope: string; isoReferences?: string[] }>()
);
export const generatePolicySuccess = createAction(
  '[AI] Generate Policy Success',
  props<{ result: any }>()
);
export const generatePolicyFailure = createAction(
  '[AI] Generate Policy Failure',
  props<{ error: string }>()
);

export const runGapAnalysis = createAction(
  '[AI] Run Gap Analysis',
  props<{ standard: string; scopeDescription: string }>()
);
export const runGapAnalysisSuccess = createAction(
  '[AI] Run Gap Analysis Success',
  props<{ result: any }>()
);

export const loadRecommendations = createAction(
  '[AI] Load Recommendations',
  props<{ context: string; module: string }>()
);
export const loadRecommendationsSuccess = createAction(
  '[AI] Load Recommendations Success',
  props<{ result: any }>()
);
