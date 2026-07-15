import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as TrainingActions from './training.actions';

@Injectable()
export class TrainingEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  loadCourses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainingActions.loadCourses),
      switchMap(({ organizationId, page = 1, pageSize = 20 }) => {
        const params = new HttpParams()
          .set('organization_id', organizationId)
          .set('page', page.toString())
          .set('page_size', pageSize.toString());
        return this.http.get<any>('/api/v1/training', { params }).pipe(
          map((res) => TrainingActions.loadCoursesSuccess({ courses: res.courses, total: res.total })),
          catchError((err) => of(TrainingActions.loadCoursesFailure({ error: err.error?.detail || 'Error' })))
        );
      })
    )
  );

  loadCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainingActions.loadCourse),
      switchMap(({ courseId }) =>
        this.http.get<any>(`/api/v1/training/${courseId}`).pipe(
          map((course) => TrainingActions.loadCourseSuccess({ course })),
          catchError((err) => of(TrainingActions.loadCourseFailure({ error: err.error?.detail || 'Error' })))
        )
      )
    )
  );

  createCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainingActions.createCourse),
      switchMap(({ course }) =>
        this.http.post<any>('/api/v1/training', course).pipe(
          map((created) => TrainingActions.createCourseSuccess({ course: created })),
          catchError((err) => of(TrainingActions.createCourseFailure({ error: err.error?.detail || 'Error' })))
        )
      )
    )
  );

  updateCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainingActions.updateCourse),
      switchMap(({ courseId, changes }) =>
        this.http.put<any>(`/api/v1/training/${courseId}`, changes).pipe(
          map((updated) => TrainingActions.updateCourseSuccess({ course: updated })),
          catchError((err) => of(TrainingActions.updateCourseFailure({ error: err.error?.detail || 'Error' })))
        )
      )
    )
  );

  deleteCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainingActions.deleteCourse),
      switchMap(({ courseId }) =>
        this.http.delete(`/api/v1/training/${courseId}`).pipe(
          map(() => TrainingActions.deleteCourseSuccess({ courseId })),
          catchError((err) => of(TrainingActions.deleteCourseFailure({ error: err.error?.detail || 'Error' })))
        )
      )
    )
  );

  loadEnrollments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainingActions.loadEnrollments),
      switchMap(({ courseId }) =>
        this.http.get<any>(`/api/v1/training/${courseId}/enrollments`).pipe(
          map((res) => TrainingActions.loadEnrollmentsSuccess({ enrollments: res.enrollments })),
          catchError(() => of(TrainingActions.loadEnrollmentsSuccess({ enrollments: [] })))
        )
      )
    )
  );

  enrollUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainingActions.enrollUser),
      switchMap(({ courseId, userId, notes }) =>
        this.http.post<any>(`/api/v1/training/${courseId}/enroll`, { user_id: userId, notes }).pipe(
          map((enrollment) => TrainingActions.enrollUserSuccess({ enrollment })),
          catchError(() => of())
        )
      )
    )
  );

  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrainingActions.loadTrainingStats),
      switchMap(({ organizationId }) => {
        const params = new HttpParams().set('organization_id', organizationId);
        return this.http.get<any>('/api/v1/training/stats', { params }).pipe(
          map((stats) => TrainingActions.loadTrainingStatsSuccess({ stats })),
          catchError(() => of(TrainingActions.loadTrainingStatsSuccess({ stats: null })))
        );
      })
    )
  );
}
