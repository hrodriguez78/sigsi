import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { selectSelectedOrganization } from '../../../store/organizations/organizations.selectors';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.reducer';

@Component({
  selector: 'app-daily-report-form',
  templateUrl: './daily-report-form.component.html',
  styleUrls: ['./daily-report-form.component.scss'],
})
export class DailyReportFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  reportId = '';
  loading = false;
  saving = false;
  private destroy$ = new Subject<void>();
  private orgId = '';

  typeOptions = [
    { value: 'bitacora_diaria', label: 'Bitácora Diaria' },
    { value: 'reporte_servicio', label: 'Reporte de Servicio' },
    { value: 'reporte_mantenimiento', label: 'Reporte de Mantenimiento' },
    { value: 'reporte_calidad', label: 'Reporte de Calidad' },
    { value: 'reporte_incidente', label: 'Reporte de Incidente' },
    { value: 'otro', label: 'Otro' },
  ];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: [''],
      report_type: ['bitacora_diaria', Validators.required],
      report_date: ['', Validators.required],
      reported_by: [''],
      hours_worked: [0, [Validators.required, Validators.min(0)]],
      activities_performed: [''],
      issues_found: [''],
      recommendations: [''],
    });

    this.store.select(selectSelectedOrganization).pipe(takeUntil(this.destroy$)).subscribe(org => {
      if (org) this.orgId = org.id;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.reportId = id;
      this.loading = true;
      this.api.get<any>(`/daily-reports/${id}`).subscribe(r => {
        this.form.patchValue({
          title: r.title,
          description: r.description,
          report_type: r.report_type,
          report_date: r.report_date ? r.report_date.substring(0, 10) : '',
          reported_by: r.reported_by,
          hours_worked: r.hours_worked,
          activities_performed: (r.activities_performed || []).join('\n'),
          issues_found: (r.issues_found || []).join('\n'),
          recommendations: r.recommendations,
        });
        this.loading = false;
      });
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  onSubmit(): void {
    if (this.form.invalid || !this.orgId) return;
    this.saving = true;
    const v = this.form.value;
    const data: any = {
      ...v,
      organization_id: this.orgId,
      activities_performed: v.activities_performed ? v.activities_performed.split('\n').filter((l: string) => l.trim()) : [],
      issues_found: v.issues_found ? v.issues_found.split('\n').filter((l: string) => l.trim()) : [],
    };

    const req = this.isEdit
      ? this.api.put(`/daily-reports/${this.reportId}`, data)
      : this.api.post('/daily-reports', data);

    req.subscribe({
      next: () => { this.router.navigate(['/daily-reports']); },
      error: () => { this.saving = false; },
    });
  }

  goBack(): void { this.router.navigate(['/daily-reports']); }
}
