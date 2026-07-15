import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';

import { Process } from '../../../core/models';
import { AppState } from '../../../store/app.reducer';
import {
  selectProcesses,
  selectProcessesLoading,
} from '../../../store/processes/processes.selectors';
import * as ProcessActions from '../../../store/processes/processes.actions';

@Component({
  selector: 'app-process-form',
  templateUrl: './process-form.component.html',
  styleUrls: ['./process-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isEditMode = false;
  processId: string | null = null;
  loading$: Observable<boolean>;
  parentProcesses$: Observable<Process[]>;

  processTypeOptions = [
    { value: 'estrategico', label: 'Estratégico' },
    { value: 'tactico', label: 'Táctico' },
    { value: 'operativo', label: 'Operativo' },
    { value: 'soporte', label: 'Soporte' },
  ];

  statusOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'borrador', label: 'Borrador' },
    { value: 'en_revision', label: 'En Revisión' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required]],
      description: [''],
      process_type: ['operativo', Validators.required],
      status: ['borrador', Validators.required],
      parent_id: [''],
    });

    this.loading$ = this.store.select(selectProcessesLoading);

    this.parentProcesses$ = this.store.select(selectProcesses).pipe(
      takeUntil(this.destroy$)
    );
  }

  ngOnInit(): void {
    this.processId = this.route.snapshot.paramMap.get('id');
    if (this.processId) {
      this.isEditMode = true;
      this.loadProcessData();
    } else {
      this.store.dispatch(
        ProcessActions.loadProcesses({
          organizationId: '',
          page: 1,
          pageSize: 100,
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProcessData(): void {
    this.store.dispatch(
      ProcessActions.loadProcesses({
        organizationId: '',
        page: 1,
        pageSize: 100,
      })
    );

    this.store
      .select(selectProcesses)
      .pipe(
        filter((processes) => processes.length > 0),
        take(1),
        takeUntil(this.destroy$)
      )
      .subscribe((processes) => {
        const process = processes.find((p) => p.id === this.processId);
        if (process) {
          this.form.patchValue({
            name: process.name,
            code: process.code,
            description: process.description,
            process_type: process.process_type,
            status: process.status,
            parent_id: process.parent_id || '',
          });
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = { ...this.form.value };
    if (!formData.parent_id) {
      delete formData.parent_id;
    }

    if (this.isEditMode && this.processId) {
      this.store.dispatch(
        ProcessActions.updateProcess({ id: this.processId, data: formData })
      );
    } else {
      this.store.dispatch(ProcessActions.createProcess({ data: formData }));
    }

    this.router.navigate(['/processes']);
  }

  onCancel(): void {
    this.router.navigate(['/processes']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
