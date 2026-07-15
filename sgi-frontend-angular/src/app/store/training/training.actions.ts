import { createAction, props } from '@ngrx/store';
import { Course, Enrollment } from '../../core/models/index';

export const loadCourses = createAction(
  '[Training] Load Courses',
  props<{ organizationId: string; page?: number; pageSize?: number }>()
);
export const loadCoursesSuccess = createAction(
  '[Training] Load Courses Success',
  props<{ courses: Course[]; total: number }>()
);
export const loadCoursesFailure = createAction(
  '[Training] Load Courses Failure',
  props<{ error: string }>()
);

export const loadCourse = createAction(
  '[Training] Load Course',
  props<{ courseId: string }>()
);
export const loadCourseSuccess = createAction(
  '[Training] Load Course Success',
  props<{ course: Course }>()
);
export const loadCourseFailure = createAction(
  '[Training] Load Course Failure',
  props<{ error: string }>()
);

export const createCourse = createAction(
  '[Training] Create Course',
  props<{ course: Partial<Course> }>()
);
export const createCourseSuccess = createAction(
  '[Training] Create Course Success',
  props<{ course: Course }>()
);
export const createCourseFailure = createAction(
  '[Training] Create Course Failure',
  props<{ error: string }>()
);

export const updateCourse = createAction(
  '[Training] Update Course',
  props<{ courseId: string; changes: Partial<Course> }>()
);
export const updateCourseSuccess = createAction(
  '[Training] Update Course Success',
  props<{ course: Course }>()
);
export const updateCourseFailure = createAction(
  '[Training] Update Course Failure',
  props<{ error: string }>()
);

export const deleteCourse = createAction(
  '[Training] Delete Course',
  props<{ courseId: string }>()
);
export const deleteCourseSuccess = createAction(
  '[Training] Delete Course Success',
  props<{ courseId: string }>()
);
export const deleteCourseFailure = createAction(
  '[Training] Delete Course Failure',
  props<{ error: string }>()
);

export const loadEnrollments = createAction(
  '[Training] Load Enrollments',
  props<{ courseId: string }>()
);
export const loadEnrollmentsSuccess = createAction(
  '[Training] Load Enrollments Success',
  props<{ enrollments: Enrollment[] }>()
);

export const enrollUser = createAction(
  '[Training] Enroll User',
  props<{ courseId: string; userId: string; notes?: string }>()
);
export const enrollUserSuccess = createAction(
  '[Training] Enroll User Success',
  props<{ enrollment: Enrollment }>()
);

export const updateEnrollment = createAction(
  '[Training] Update Enrollment',
  props<{ enrollmentId: string; changes: Partial<Enrollment> }>()
);
export const updateEnrollmentSuccess = createAction(
  '[Training] Update Enrollment Success',
  props<{ enrollment: Enrollment }>()
);

export const loadTrainingStats = createAction(
  '[Training] Load Stats',
  props<{ organizationId: string }>()
);
export const loadTrainingStatsSuccess = createAction(
  '[Training] Load Stats Success',
  props<{ stats: any }>()
);
