import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Incident } from '../../../core/models/index';
import {
  createIncident,
  updateIncident,
} from '../../../store/incidents/incidents.actions';
import {
  selectIncidentById,
  selectIncidentsLoading,
} from '../../../store/incidents/incidents.selectors';

@Component({
  selector: 'app-incident-form',
  templateUrl: './incident-form.component.html',
  styleUrls: ['./incident-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  incidentId: string | null = null;
  loading = false;
  submitted = false;

  incidentTypes = [
    { value: 'seguridad', label: 'Seguridad' },
    { value: 'disponibilidad', label: 'Disponibilidad' },
    { value: 'brecha_datos', label: 'Brecha de Datos' },
    { value: 'malware', label: 'Malware' },
    { value: 'phishing', label: 'Phishing' },
    { value: 'acceso_no_autorizado', label: 'Acceso No Autorizado' },
    { value: 'configuracion', label: 'Configuración' },
    { value: 'error_humano', label: 'Error Humano' },
    { value: 'otro', label: 'Otro' },
  ];

  severities = [
    { value: 'bajo', label: 'Bajo' },
    { value: 'medio', label: 'Medio' },
    { value: 'alto', label: 'Alto' },
    { value: 'critico', label: 'Crítico' },
  ];

  priorities = [
    { value: 'p1_critico', label: 'P1 - Crítico' },
    { value: 'p2_alto', label: 'P2 - Alto' },
    { value: 'p3_medio', label: 'P3 - Medio' },
    { value: 'p4_bajo', label: 'P4 - Bajo' },
  ];

  statuses = [
    { value: 'abierto', label: 'Abierto' },
    { value: 'en_investigacion', label: 'En Investigación' },
    { value: 'contenido', label: 'Contenido' },
    { value: 'erradicado', label: 'Erradicado' },
    { value: 'recuperado', label: 'Recuperado' },
    { value: 'cerrado', label: 'Cerrado' },
  ];

  affectedAssetsInput = '';
  affectedProcessesInput = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.incidentId = this.route.snapshot.paramMap.get('id');
    if (this.incidentId) {
      this.isEditMode = true;
      this.loadIncidentData(this.incidentId);
    }

    this.store
      .select(selectIncidentsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.loading = loading;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required]],
      incident_type: ['', [Validators.required]],
      severity: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      status: ['abierto', [Validators.required]],
      detection_method: [''],
      assigned_to: [''],
      reported_by: [''],
      root_cause: [''],
      containment_actions: [''],
      lessons_learned: [''],
      affected_assets: [''],
      affected_processes: [''],
    });
  }

  private loadIncidentData(id: string): void {
    this.store
      .select(selectIncidentById(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe((incident) => {
        if (incident) {
          this.form.patchValue({
            title: incident.title,
            description: incident.description,
            incident_type: incident.incident_type,
            severity: incident.severity,
            priority: incident.priority,
            status: incident.status,
            detection_method: incident.detection_method || '',
            assigned_to: incident.assigned_to || '',
            reported_by: incident.reported_by || '',
            root_cause: incident.root_cause || '',
            containment_actions: incident.containment_actions || '',
            lessons_learned: incident.lessons_learned || '',
            affected_assets: incident.affected_assets?.join(', ') || '',
            affected_processes: incident.affected_processes?.join(', ') || '',
          });
          this.cdr.markForCheck();
        }
      });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    const formData = {
      ...this.form.value,
      affected_assets: this.form.value.affected_assets
        ? this.form.value.affected_assets.split(',').map((a: string) => a.trim()).filter(Boolean)
        : [],
      affected_processes: this.form.value.affected_processes
        ? this.form.value.affected_processes.split(',').map((p: string) => p.trim()).filter(Boolean)
        : [],
    };

    if (this.isEditMode && this.incidentId) {
      this.store.dispatch(
        updateIncident({ id: this.incidentId, data: formData })
      );
    } else {
      this.store.dispatch(createIncident({ data: formData }));
    }
  }

  cancel(): void {
    this.router.navigate(['/incidents']);
  }
}
