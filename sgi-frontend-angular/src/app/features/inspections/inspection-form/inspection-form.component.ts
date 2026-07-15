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
  selector: 'app-inspection-form',
  templateUrl: './inspection-form.component.html',
  styleUrls: ['./inspection-form.component.scss'],
})
export class InspectionFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  inspectionId = '';
  loading = false;
  saving = false;
  private destroy$ = new Subject<void>();
  private orgId = '';

  typeOptions = [
    { value: 'calidad', label: 'Calidad' },
    { value: 'seguridad', label: 'Seguridad' },
    { value: 'ambiental', label: 'Ambiental' },
    { value: 'operacional', label: 'Operacional' },
    { value: 'cumplimiento', label: 'Cumplimiento' },
    { value: 'seguridad_industrial', label: 'Seguridad Industrial' },
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
      inspection_type: ['calidad', Validators.required],
      scheduled_date: [''],
      inspector_name: [''],
      location: [''],
      notes: [''],
    });

    this.store.select(selectSelectedOrganization).pipe(takeUntil(this.destroy$)).subscribe(org => {
      if (org) this.orgId = org.id;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.inspectionId = id;
      this.loading = true;
      this.api.get<any>(`/inspections/${id}`).subscribe(i => {
        this.form.patchValue({
          title: i.title,
          description: i.description,
          inspection_type: i.inspection_type,
          scheduled_date: i.scheduled_date || '',
          inspector_name: i.inspector_name,
          location: i.location,
          notes: i.notes,
        });
        this.loading = false;
      });
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  onSubmit(): void {
    if (this.form.invalid || !this.orgId) return;
    this.saving = true;
    const data = { ...this.form.value, organization_id: this.orgId };
    if (data.scheduled_date) data.scheduled_date = data.scheduled_date.substring(0, 10);

    const req = this.isEdit
      ? this.api.put(`/inspections/${this.inspectionId}`, data)
      : this.api.post('/inspections', data);

    req.subscribe({
      next: () => { this.router.navigate(['/inspections']); },
      error: () => { this.saving = false; },
    });
  }

  goBack(): void { this.router.navigate(['/inspections']); }
}
