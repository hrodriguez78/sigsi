import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../store/app.reducer';
import * as TrainingActions from '../../../store/training/training.actions';
import { selectSelectedCourse } from '../../../store/training/training.selectors';
import { selectUser } from '../../../store/auth/auth.selectors';
import { Course } from '../../../core/models/index';

@Component({
  selector: 'app-training-form',
  templateUrl: './training-form.component.html',
  styleUrls: ['./training-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  form: FormGroup;
  isEdit = false;
  courseId: string | null = null;
  organizationId = '';

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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private store: Store<AppState>,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      category: ['concienciacion', Validators.required],
      status: ['borrador'],
      duration_hours: [1, [Validators.required, Validators.min(0.5)]],
      instructor: [''],
      max_participants: [null],
      is_mandatory: [false],
      tags: [''],
    });
  }

  ngOnInit(): void {
    this.store.select(selectUser).pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) this.organizationId = (user as any).organization_id || '';
    });

    this.courseId = this.route.snapshot.paramMap.get('id');
    if (this.courseId) {
      this.isEdit = true;
      this.store.dispatch(TrainingActions.loadCourse({ courseId: this.courseId }));
      this.store.select(selectSelectedCourse).pipe(takeUntil(this.destroy$)).subscribe((course) => {
        if (course && this.isEdit) {
          this.form.patchValue({
            title: course.title,
            code: course.code,
            description: course.description,
            category: course.category,
            status: course.status,
            duration_hours: course.duration_hours,
            instructor: course.instructor,
            max_participants: course.max_participants,
            is_mandatory: course.is_mandatory,
            tags: course.tags?.join(', ') || '',
          });
          this.cdr.markForCheck();
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = { ...this.form.value };
    value.organization_id = this.organizationId;
    value.tags = value.tags ? value.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

    if (this.isEdit && this.courseId) {
      this.store.dispatch(TrainingActions.updateCourse({ courseId: this.courseId, changes: value }));
      this.router.navigate(['/training', this.courseId]);
    } else {
      this.store.dispatch(TrainingActions.createCourse({ course: value }));
      this.router.navigate(['/training']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
