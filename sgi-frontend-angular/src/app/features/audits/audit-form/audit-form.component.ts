import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Audit } from '../../../core/models';
import {
  loadAuditById,
  createAudit,
  updateAudit,
} from '../../../store/audits/audits.actions';
import { selectCurrentAudit, selectDetailLoading } from '../../../store/audits/audits.selectors';

@Component({
  selector: 'app-audit-form',
  templateUrl: './audit-form.component.html',
  styleUrls: ['./audit-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isEditMode = false;
  auditId: string | null = null;
  loading = false;
  saving = false;

  private destroy$ = new Subject<void>();

  auditTypeOptions = [
    { value: 'interna', label: 'Interna' },
    { value: 'externa', label: 'Externa' },
    { value: 'proveedor', label: 'Proveedor' },
    { value: 'autoevaluacion', label: 'Autoevaluación' },
  ];

  statusOptions = [
    { value: 'planificada', label: 'Planificada' },
    { value: 'en_curso', label: 'En Curso' },
    { value: 'completada', label: 'Completada' },
    { value: 'reporte_cerrado', label: 'Reporte Cerrado' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      audit_type: ['interna', Validators.required],
      scope: ['', Validators.required],
      criteria: ['', Validators.required],
      planned_date: [''],
      start_date: [''],
      end_date: [''],
      auditor_name: [''],
      auditor_email: ['', Validators.email],
      status: ['planificada', Validators.required],
      team_members: [''],
      processes_to_audit: [''],
      summary: [''],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.auditId = this.route.snapshot.paramMap.get('id');
    if (this.auditId) {
      this.isEditMode = true;
      this.store.dispatch(loadAuditById({ id: this.auditId }));

      this.store
        .select(selectCurrentAudit)
        .pipe(takeUntil(this.destroy$))
        .subscribe(audit => {
          if (audit) {
            this.populateForm(audit);
            this.cdr.markForCheck();
          }
        });
    }

    this.store
      .select(selectDetailLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  populateForm(audit: Audit): void {
    this.form.patchValue({
      title: audit.title,
      audit_type: audit.audit_type,
      scope: audit.scope,
      criteria: audit.criteria,
      planned_date: audit.planned_date ? audit.planned_date.substring(0, 10) : '',
      start_date: audit.start_date ? audit.start_date.substring(0, 10) : '',
      end_date: audit.end_date ? audit.end_date.substring(0, 10) : '',
      auditor_name: audit.auditor_name || '',
      auditor_email: audit.auditor_email || '',
      status: audit.status,
      team_members: audit.team_members?.join(', ') || '',
      processes_to_audit: audit.processes_to_audit?.join(', ') || '',
      summary: audit.summary || '',
      notes: audit.notes || '',
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValue = { ...this.form.value };

    formValue.team_members = formValue.team_members
      ? formValue.team_members.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    formValue.processes_to_audit = formValue.processes_to_audit
      ? formValue.processes_to_audit.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    if (!formValue.planned_date) delete formValue.planned_date;
    if (!formValue.start_date) delete formValue.start_date;
    if (!formValue.end_date) delete formValue.end_date;
    if (!formValue.auditor_name) delete formValue.auditor_name;
    if (!formValue.auditor_email) delete formValue.auditor_email;
    if (!formValue.summary) delete formValue.summary;

    this.saving = true;

    if (this.isEditMode && this.auditId) {
      this.store.dispatch(updateAudit({ id: this.auditId, data: formValue }));
    } else {
      this.store.dispatch(createAudit({ data: formValue }));
    }

    this.router.navigate(['/audits']);
  }

  onCancel(): void {
    this.router.navigate(['/audits']);
  }

  get f() {
    return this.form.controls;
  }
}
