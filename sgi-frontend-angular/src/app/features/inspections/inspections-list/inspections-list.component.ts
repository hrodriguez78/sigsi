import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { selectSelectedOrganization } from '../../../store/organizations/organizations.selectors';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.reducer';

interface Inspection {
  id: string;
  inspection_number: string;
  title: string;
  inspection_type: string;
  status: string;
  result: string;
  inspector_name: string;
  location: string;
  scheduled_date: string;
  score: number | null;
  checklist: any[];
  created_at: string;
}

@Component({
  selector: 'app-inspections-list',
  templateUrl: './inspections-list.component.html',
  styleUrls: ['./inspections-list.component.scss'],
})
export class InspectionsListComponent implements OnInit, OnDestroy {
  inspections: Inspection[] = [];
  loading = false;
  total = 0;
  currentPage = 1;
  pageSize = 20;
  search = '';
  filterStatus = '';
  filterType = '';
  filterResult = '';
  stats: any = null;
  private destroy$ = new Subject<void>();
  private orgId = '';

  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'programada', label: 'Programada' },
    { value: 'en_curso', label: 'En Curso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  typeOptions = [
    { value: '', label: 'Todos' },
    { value: 'calidad', label: 'Calidad' },
    { value: 'seguridad', label: 'Seguridad' },
    { value: 'ambiental', label: 'Ambiental' },
    { value: 'operacional', label: 'Operacional' },
    { value: 'cumplimiento', label: 'Cumplimiento' },
    { value: 'seguridad_industrial', label: 'Seg. Industrial' },
  ];

  resultOptions = [
    { value: '', label: 'Todos' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'no_aprobado', label: 'No Aprobado' },
    { value: 'parcial', label: 'Parcial' },
    { value: 'pendiente', label: 'Pendiente' },
  ];

  constructor(private api: ApiService, private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.select(selectSelectedOrganization).pipe(takeUntil(this.destroy$)).subscribe(org => {
      if (org) { this.orgId = org.id; this.loadData(); }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadData(): void {
    if (!this.orgId) return;
    this.loading = true;
    const params = `?organization_id=${this.orgId}&page=${this.currentPage}&page_size=${this.pageSize}&search=${this.search}&status=${this.filterStatus}&inspection_type=${this.filterType}&result=${this.filterResult}`;
    this.api.get<{ inspections: Inspection[]; total: number }>(`/inspections${params}`).subscribe({
      next: (res) => { this.inspections = res.inspections; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; },
    });
    this.api.get<any>(`/inspections/stats?organization_id=${this.orgId}`).subscribe({ next: s => this.stats = s });
  }

  onSearch(): void { this.currentPage = 1; this.loadData(); }
  onFilterChange(): void { this.currentPage = 1; this.loadData(); }
  onPageChange(page: number): void { this.currentPage = page; this.loadData(); }

  deleteInspection(insp: Inspection): void {
    if (!confirm(`¿Eliminar inspección "${insp.title}"?`)) return;
    this.api.delete(`/inspections/${insp.id}`).subscribe(() => this.loadData());
  }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = { programada: 'Programada', en_curso: 'En Curso', completada: 'Completada', cancelada: 'Cancelada' };
    return m[s] || s;
  }
  getStatusClass(s: string): string {
    const m: Record<string, string> = { programada: 'badge-new', en_curso: 'badge-review', completada: 'badge-hired', cancelada: 'badge-rejected' };
    return m[s] || '';
  }
  getResultLabel(r: string): string {
    const m: Record<string, string> = { aprobado: 'Aprobado', no_aprobado: 'No Aprobado', parcial: 'Parcial', pendiente: 'Pendiente' };
    return m[r] || r;
  }
  getResultClass(r: string): string {
    const m: Record<string, string> = { aprobado: 'badge-hired', no_aprobado: 'badge-rejected', parcial: 'badge-review', pendiente: 'badge-new' };
    return m[r] || '';
  }
  getTypeLabel(t: string): string {
    const m: Record<string, string> = { calidad: 'Calidad', seguridad: 'Seguridad', ambiental: 'Ambiental', operacional: 'Operacional', cumplimiento: 'Cumplimiento', seguridad_industrial: 'Seg. Industrial', otro: 'Otro' };
    return m[t] || t;
  }
}
