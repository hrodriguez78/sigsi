import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as AIActions from './ai.actions';

@Injectable()
export class AIEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  sendChat$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AIActions.sendChatMessage),
      switchMap(({ message, sessionId }) =>
        this.http.post<any>('/api/v1/ai/chat', { message, session_id: sessionId }).pipe(
          map((res) => AIActions.sendChatMessageSuccess({ sessionId: res.session_id, message: res.message })),
          catchError((err) => of(AIActions.sendChatMessageFailure({ error: err.error?.detail || 'Error de IA' })))
        )
      )
    )
  );

  loadSessions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AIActions.loadSessions),
      switchMap(() =>
        this.http.get<any[]>('/api/v1/ai/sessions').pipe(
          map((sessions) => AIActions.loadSessionsSuccess({ sessions })),
          catchError(() => of(AIActions.loadSessionsSuccess({ sessions: [] })))
        )
      )
    )
  );

  loadSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AIActions.loadSession),
      switchMap(({ sessionId }) =>
        this.http.get<any>(`/api/v1/ai/sessions/${sessionId}`).pipe(
          map((session) => AIActions.loadSessionSuccess({ session })),
          catchError(() => of())
        )
      )
    )
  );

  deleteSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AIActions.deleteSession),
      switchMap(({ sessionId }) =>
        this.http.delete(`/api/v1/ai/sessions/${sessionId}`).pipe(
          map(() => AIActions.loadSessions()),
          catchError(() => of())
        )
      )
    )
  );

  generatePolicy$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AIActions.generatePolicy),
      switchMap(({ policyType, title, scope, isoReferences }) =>
        this.http.post<any>('/api/v1/ai/generate-policy', {
          policy_type: policyType, title, scope, iso_references: isoReferences || [],
        }).pipe(
          map((result) => AIActions.generatePolicySuccess({ result })),
          catchError((err) => of(AIActions.generatePolicyFailure({ error: err.error?.detail || 'Error' })))
        )
      )
    )
  );

  gapAnalysis$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AIActions.runGapAnalysis),
      switchMap(({ standard, scopeDescription }) =>
        this.http.post<any>('/api/v1/ai/gap-analysis', {
          standard, scope_description: scopeDescription,
        }).pipe(
          map((result) => AIActions.runGapAnalysisSuccess({ result })),
          catchError(() => of())
        )
      )
    )
  );

  loadRecommendations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AIActions.loadRecommendations),
      switchMap(({ context, module: mod }) =>
        this.http.post<any>('/api/v1/ai/recommendations', { context, module: mod }).pipe(
          map((result) => AIActions.loadRecommendationsSuccess({ result })),
          catchError(() => of())
        )
      )
    )
  );
}
