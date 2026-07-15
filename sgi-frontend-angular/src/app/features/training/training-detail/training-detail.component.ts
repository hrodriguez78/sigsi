import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../store/app.reducer';
import * as TrainingActions from '../../../store/training/training.actions';
import { selectSelectedCourse, selectEnrollments } from '../../../store/training/training.selectors';
import { Course, Enrollment } from '../../../core/models/index';

@Component({
  selector: 'app-training-detail',
  templateUrl: './training-detail.component.html',
  styleUrls: ['./training-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  course: Course | null = null;
  enrollments: Enrollment[] = [];

  categories: Record<string, string> = {
    concienciacion: 'Concienciación', tecnico: 'Técnico', cumplimiento: 'Cumplimiento',
    liderazgo: 'Liderazgo', emergencias: 'Emergencias', otro: 'Otro',
  };

  statuses: Record<string, string> = {
    borrador: 'Borrador', publicado: 'Publicado', en_curso: 'En curso',
    completado: 'Completado', archivado: 'Archivado',
  };

  enrollmentStatuses: Record<string, string> = {
    inscrito: 'Inscrito', en_curso: 'En curso', completado: 'Completado',
    reprobado: 'Reprobado', cancelado: 'Cancelado',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.dispatch(TrainingActions.loadCourse({ courseId: id }));
      this.store.dispatch(TrainingActions.loadEnrollments({ courseId: id }));
    }

    this.store.select(selectSelectedCourse).pipe(takeUntil(this.destroy$)).subscribe((course) => {
      this.course = course;
      this.cdr.markForCheck();
    });

    this.store.select(selectEnrollments).pipe(takeUntil(this.destroy$)).subscribe((enrollments) => {
      this.enrollments = enrollments;
      this.cdr.markForCheck();
    });
  }

  deleteCourse(): void {
    if (this.course && confirm(`¿Eliminar curso "${this.course.title}"?`)) {
      this.store.dispatch(TrainingActions.deleteCourse({ courseId: this.course.id }));
      this.router.navigate(['/training']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
