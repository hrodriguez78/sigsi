import { createReducer, on } from '@ngrx/store';
import * as TrainingActions from './training.actions';
import { Course, Enrollment } from '../../core/models/index';

export interface TrainingState {
  courses: Course[];
  total: number;
  selectedCourse: Course | null;
  enrollments: Enrollment[];
  stats: any | null;
  loading: boolean;
  error: string | null;
}

export const initialState: TrainingState = {
  courses: [],
  total: 0,
  selectedCourse: null,
  enrollments: [],
  stats: null,
  loading: false,
  error: null,
};

export const trainingReducer = createReducer(
  initialState,
  on(TrainingActions.loadCourses, (state) => ({ ...state, loading: true, error: null })),
  on(TrainingActions.loadCoursesSuccess, (state, { courses, total }) => ({
    ...state, courses, total, loading: false,
  })),
  on(TrainingActions.loadCoursesFailure, (state, { error }) => ({
    ...state, error, loading: false,
  })),
  on(TrainingActions.loadCourse, (state) => ({ ...state, loading: true })),
  on(TrainingActions.loadCourseSuccess, (state, { course }) => ({
    ...state, selectedCourse: course, loading: false,
  })),
  on(TrainingActions.createCourseSuccess, (state, { course }) => ({
    ...state, courses: [course, ...state.courses], total: state.total + 1,
  })),
  on(TrainingActions.updateCourseSuccess, (state, { course }) => ({
    ...state,
    courses: state.courses.map((c) => (c.id === course.id ? course : c)),
    selectedCourse: course,
  })),
  on(TrainingActions.deleteCourseSuccess, (state, { courseId }) => ({
    ...state,
    courses: state.courses.filter((c) => c.id !== courseId),
    total: state.total - 1,
  })),
  on(TrainingActions.loadEnrollmentsSuccess, (state, { enrollments }) => ({
    ...state, enrollments,
  })),
  on(TrainingActions.enrollUserSuccess, (state, { enrollment }) => ({
    ...state, enrollments: [enrollment, ...state.enrollments],
  })),
  on(TrainingActions.updateEnrollmentSuccess, (state, { enrollment }) => ({
    ...state,
    enrollments: state.enrollments.map((e) =>
      e.id === enrollment.id ? enrollment : e
    ),
  })),
  on(TrainingActions.loadTrainingStatsSuccess, (state, { stats }) => ({
    ...state, stats,
  })),
);
