import { createReducer, on } from '@ngrx/store';
import * as AIActions from './ai.actions';

export interface AIState {
  chatMessages: { role: string; content: string }[];
  currentSessionId: string | null;
  sessions: any[];
  currentSession: any | null;
  policyResult: any | null;
  gapResult: any | null;
  recommendations: any | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AIState = {
  chatMessages: [],
  currentSessionId: null,
  sessions: [],
  currentSession: null,
  policyResult: null,
  gapResult: null,
  recommendations: null,
  loading: false,
  error: null,
};

export const aiReducer = createReducer(
  initialState,
  on(AIActions.sendChatMessage, (state, { message }) => ({
    ...state,
    chatMessages: [...state.chatMessages, { role: 'user', content: message }],
    loading: true,
  })),
  on(AIActions.sendChatMessageSuccess, (state, { sessionId, message }) => ({
    ...state,
    currentSessionId: sessionId,
    chatMessages: [...state.chatMessages, { role: 'assistant', content: message }],
    loading: false,
  })),
  on(AIActions.sendChatMessageFailure, (state, { error }) => ({
    ...state, error, loading: false,
  })),
  on(AIActions.loadSessionsSuccess, (state, { sessions }) => ({
    ...state, sessions,
  })),
  on(AIActions.loadSessionSuccess, (state, { session }) => ({
    ...state, currentSession: session, chatMessages: session?.messages || [],
  })),
  on(AIActions.deleteSession, (state, { sessionId }) => ({
    ...state,
    sessions: state.sessions.filter((s: any) => s.id !== sessionId),
  })),
  on(AIActions.generatePolicySuccess, (state, { result }) => ({
    ...state, policyResult: result, loading: false,
  })),
  on(AIActions.generatePolicy, (state) => ({
    ...state, loading: true,
  })),
  on(AIActions.runGapAnalysisSuccess, (state, { result }) => ({
    ...state, gapResult: result, loading: false,
  })),
  on(AIActions.runGapAnalysis, (state) => ({
    ...state, loading: true,
  })),
  on(AIActions.loadRecommendationsSuccess, (state, { result }) => ({
    ...state, recommendations: result,
  })),
);
