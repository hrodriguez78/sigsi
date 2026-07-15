import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../store/app.reducer';
import * as TrainingActions from '../../../store/training/training.actions';
import { selectCourses, selectCoursesLoading, selectCoursesTotal } from '../../../store/training/training.selectors';
import { selectUser } from '../../../store/auth/auth.selectors';
import { Course } from '../../../core/models/index';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-training-list',
  templateUrl: './training-list.component.html',
  styleUrls: ['./training-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  courses: Course[] = [];
  loading = false;
  total = 0;
  page = 1;
  pageSize = 20;

  categoryFilter = '';
  statusFilter = '';
  search = '';

  categories = [
    { value: 'concienciacion', label: 'Concienciación' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'cumplimiento', label: 'Cumplimiento' },
    { value: 'liderazgo', label: 'Liderazgo' },
    { value: 'emergencias', label: 'Emergencias' },
    { value: 'otro', label: 'Otro' },
  ];

  statuses = [
    { value: 'borrador', label: 'Borrador' },
    { value: 'publicado', label: 'Publicado' },
    { value: 'en_curso', label: 'En curso' },
    { value: 'completado', label: 'Completado' },
    { value: 'archivado', label: 'Archivado' },
  ];

  private organizationId = '';

  constructor(private store: Store<AppState>, private cdr: ChangeDetectorRef, private exportService: ExportService) {}

  ngOnInit(): void {
    this.store.select(selectUser).pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.organizationId = (user as any).organization_id || '';
        this.loadCourses();
      }
    });

    this.store.select(selectCourses).pipe(takeUntil(this.destroy$)).subscribe((courses) => {
      this.courses = courses;
      this.cdr.markForCheck();
    });

    this.store.select(selectCoursesLoading).pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.loading = loading;
      this.cdr.markForCheck();
    });

    this.store.select(selectCoursesTotal).pipe(takeUntil(this.destroy$)).subscribe((total) => {
      this.total = total;
      this.cdr.markForCheck();
    });
  }

  loadCourses(): void {
    this.store.dispatch(TrainingActions.loadCourses({
      organizationId: this.organizationId,
      page: this.page,
      pageSize: this.pageSize,
    }));
  }

  onSearch(): void {
    this.page = 1;
    this.loadCourses();
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadCourses();
  }

  exportData(): void {
    this.exportService.exportModule('training');
  }

  deleteCourse(course: Course): void {
    if (confirm(`¿Eliminar curso "${course.title}"?`)) {
      this.store.dispatch(TrainingActions.deleteCourse({ courseId: course.id }));
    }
  }

  getStatusLabel(status: string): string {
    const found = this.statuses.find((s) => s.value === status);
    return found ? found.label : status;
  }

  getCategoryLabel(cat: string): string {
    const found = this.categories.find((c) => c.value === cat);
    return found ? found.label : cat;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
