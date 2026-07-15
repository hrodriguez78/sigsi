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
  selector: 'app-work-order-form',
  templateUrl: './work-order-form.component.html',
  styleUrls: ['./work-order-form.component.scss'],
})
export class WorkOrderFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  workOrderId = '';
  loading = false;
  saving = false;
  private destroy$ = new Subject<void>();
  private orgId = '';

  typeOptions = [
    { value: 'mantenimiento_preventivo', label: 'Mantenimiento Preventivo' },
    { value: 'mantenimiento_correctivo', label: 'Mantenimiento Correctivo' },
    { value: 'aseo_interior', label: 'Aseo Interior' },
    { value: 'aseo_exterior', label: 'Aseo Exterior' },
    { value: 'aseo_industrial', label: 'Aseo Industrial' },
    { value: 'emergencia', label: 'Emergencia' },
    { value: 'instalacion', label: 'Instalación' },
    { value: 'otro', label: 'Otro' },
  ];

  priorityOptions = [
    { value: 'critica', label: 'Crítica' },
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Media' },
    { value: 'baja', label: 'Baja' },
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
      order_type: ['aseo_interior', Validators.required],
      priority: ['media', Validators.required],
      assigned_to: [''],
      scheduled_date: [''],
      due_date: [''],
      location: [''],
      notes: [''],
    });

    this.store.select(selectSelectedOrganization).pipe(takeUntil(this.destroy$)).subscribe(org => {
      if (org) this.orgId = org.id;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.workOrderId = id;
      this.loading = true;
      this.api.get<any>(`/work-orders/${id}`).subscribe(wo => {
        this.form.patchValue({
          title: wo.title,
          description: wo.description,
          order_type: wo.order_type,
          priority: wo.priority,
          assigned_to: wo.assigned_to || '',
          scheduled_date: wo.scheduled_date ? wo.scheduled_date.substring(0, 16) : '',
          due_date: wo.due_date ? wo.due_date.substring(0, 16) : '',
          location: wo.location,
          notes: wo.notes,
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
    if (data.scheduled_date) data.scheduled_date = new Date(data.scheduled_date).toISOString();
    if (data.due_date) data.due_date = new Date(data.due_date).toISOString();

    const req = this.isEdit
      ? this.api.put(`/work-orders/${this.workOrderId}`, data)
      : this.api.post('/work-orders', data);

    req.subscribe({
      next: () => { this.router.navigate(['/work-orders']); },
      error: () => { this.saving = false; },
    });
  }

  goBack(): void { this.router.navigate(['/work-orders']); }
}
