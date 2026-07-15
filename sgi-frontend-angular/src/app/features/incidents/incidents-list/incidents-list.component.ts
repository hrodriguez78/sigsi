import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import {
  Incident,
  IncidentType,
  IncidentSeverity,
  IncidentPriority,
  IncidentStatus,
} from '../../../core/models/index';
import {
  loadIncidents,
  deleteIncident,
  loadIncidentStats,
} from '../../../store/incidents/incidents.actions';
import {
  selectIncidents,
  selectIncidentsState,
  selectIncidentStats,
} from '../../../store/incidents/incidents.selectors';
import { AppState } from '../../../store/app.reducer';
import { AuthService } from '../../../core/services/auth.service';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-incidents-list',
  templateUrl: './incidents-list.component.html',
  styleUrls: ['./incidents-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentsListComponent implements OnInit {
  incidents: Incident[] = [];
  stats: { total: number; abiertos: number; en_investigacion: number; cerrados: number } | null = null;
  loading = false;

  filters = {
    incident_type: '',
    severity: '',
    priority: '',
    status: '',
    search: '',
  };

  incidentTypes: IncidentType[] = [
    'seguridad',
    'disponibilidad',
    'brecha_datos',
    'malware',
    'phishing',
    'acceso_no_autorizado',
    'configuracion',
    'error_humano',
    'otro',
  ];

  severities: IncidentSeverity[] = ['bajo', 'medio', 'alto', 'critico'];
  priorities: IncidentPriority[] = ['p1_critico', 'p2_alto', 'p3_medio', 'p4_bajo'];
  statuses: IncidentStatus[] = [
    'abierto',
    'en_investigacion',
    'contenido',
    'erradicado',
    'recuperado',
    'cerrado',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private exportService: ExportService,
  ) {}

  ngOnInit(): void {
    const orgId = this.authService.currentUser?.organization_id || '';
    if (orgId) {
      this.store.dispatch(loadIncidents({ organizationId: orgId }));
      this.store.dispatch(loadIncidentStats({ organizationId: orgId }));
    }

    this.store
      .select(selectIncidents)
      .pipe(takeUntil(this.destroy$))
      .subscribe((incidents) => {
        this.incidents = incidents;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectIncidentsState)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.loading = state.loading;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectIncidentStats)
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => {
        this.stats = stats;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredIncidents(): Incident[] {
    let result = this.incidents;

    if (this.filters.incident_type) {
      result = result.filter((i) => i.incident_type === this.filters.incident_type);
    }
    if (this.filters.severity) {
      result = result.filter((i) => i.severity === this.filters.severity);
    }
    if (this.filters.priority) {
      result = result.filter((i) => i.priority === this.filters.priority);
    }
    if (this.filters.status) {
      result = result.filter((i) => i.status === this.filters.status);
    }
    if (this.filters.search) {
      const term = this.filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(term) ||
          i.description?.toLowerCase().includes(term)
      );
    }

    return result;
  }

  exportData(): void {
    this.exportService.exportModule('incidents');
  }

  clearFilters(): void {
    this.filters = {
      incident_type: '',
      severity: '',
      priority: '',
      status: '',
      search: '',
    };
    this.cdr.markForCheck();
  }

  viewIncident(id: string): void {
    this.router.navigate(['/incidents', id]);
  }

  editIncident(id: string): void {
    this.router.navigate(['/incidents', id, 'edit']);
  }

  deleteIncidentAction(id: string): void {
    if (confirm('¿Está seguro de eliminar este incidente?')) {
      this.store.dispatch(deleteIncident({ id }));
    }
  }

  getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      bajo: 'Bajo',
      medio: 'Medio',
      alto: 'Alto',
      critico: 'Crítico',
    };
    return labels[severity] || severity;
  }

  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      p1_critico: 'P1',
      p2_alto: 'P2',
      p3_medio: 'P3',
      p4_bajo: 'P4',
    };
    return labels[priority] || priority;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      abierto: 'Abierto',
      en_investigacion: 'En Investigación',
      contenido: 'Contenido',
      erradicado: 'Erradicado',
      recuperado: 'Recuperado',
      cerrado: 'Cerrado',
    };
    return labels[status] || status;
  }

  getIncidentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      seguridad: 'Seguridad',
      disponibilidad: 'Disponibilidad',
      brecha_datos: 'Brecha de Datos',
      malware: 'Malware',
      phishing: 'Phishing',
      acceso_no_autorizado: 'Acceso No Autorizado',
      configuracion: 'Configuración',
      error_humano: 'Error Humano',
      otro: 'Otro',
    };
    return labels[type] || type;
  }
}
