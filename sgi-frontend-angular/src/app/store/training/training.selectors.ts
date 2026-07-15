import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TrainingState } from './training.reducer';

export const selectTrainingState = createFeatureSelector<TrainingState>('training');
export const selectCourses = createSelector(selectTrainingState, (s) => s.courses);
export const selectCoursesTotal = createSelector(selectTrainingState, (s) => s.total);
export const selectCoursesLoading = createSelector(selectTrainingState, (s) => s.loading);
export const selectSelectedCourse = createSelector(selectTrainingState, (s) => s.selectedCourse);
export const selectEnrollments = createSelector(selectTrainingState, (s) => s.enrollments);
export const selectTrainingStats = createSelector(selectTrainingState, (s) => s.stats);
