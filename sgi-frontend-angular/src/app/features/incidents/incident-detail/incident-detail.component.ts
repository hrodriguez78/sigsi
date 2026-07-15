import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Incident } from '../../../core/models/index';
import {
  loadIncidentStats,
  addIncidentComment,
  deleteIncident,
  updateIncident,
} from '../../../store/incidents/incidents.actions';
import {
  selectIncidentById,
  selectIncidentsLoading,
} from '../../../store/incidents/incidents.selectors';

@Component({
  selector: 'app-incident-detail',
  templateUrl: './incident-detail.component.html',
  styleUrls: ['./incident-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailComponent implements OnInit {
  incident: Incident | null = null;
  loading = false;
  newComment = '';

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store
        .select(selectIncidentById(id))
        .pipe(takeUntil(this.destroy$))
        .subscribe((incident) => {
          this.incident = incident || null;
          this.cdr.markForCheck();
        });
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
      p1_critico: 'P1 Crítico',
      p2_alto: 'P2 Alto',
      p3_medio: 'P3 Medio',
      p4_bajo: 'P4 Bajo',
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

  addComment(): void {
    if (!this.incident || !this.newComment.trim()) return;

    this.store.dispatch(
      addIncidentComment({
        incidentId: this.incident.id,
        comment: {
          text: this.newComment.trim(),
          author: 'Usuario Actual',
          created_at: new Date().toISOString(),
        },
      })
    );

    this.newComment = '';
    this.cdr.markForCheck();
  }

  advanceStatus(): void {
    if (!this.incident) return;
    const workflow: Record<string, string> = {
      abierto: 'en_investigacion',
      en_investigacion: 'contenido',
      contenido: 'erradicado',
      erradicado: 'recuperado',
      recuperado: 'cerrado',
    };
    const nextStatus = workflow[this.incident.status] as Incident['status'] | undefined;
    if (nextStatus) {
      this.store.dispatch(
        updateIncident({ id: this.incident.id, data: { status: nextStatus } })
      );
    }
  }

  editIncident(): void {
    if (this.incident) {
      this.router.navigate(['/incidents', this.incident.id, 'edit']);
    }
  }

  deleteIncidentAction(): void {
    if (this.incident && confirm('¿Está seguro de eliminar este incidente?')) {
      this.store.dispatch(deleteIncident({ id: this.incident.id }));
      this.router.navigate(['/incidents']);
    }
  }

  goBack(): void {
    this.router.navigate(['/incidents']);
  }
}
