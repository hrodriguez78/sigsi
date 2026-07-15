import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { selectSelectedOrganization } from '../../../store/organizations/organizations.selectors';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.reducer';

interface DailyReport {
  id: string;
  report_number: string;
  title: string;
  report_type: string;
  report_date: string;
  reported_by: string;
  hours_worked: number;
  status: string;
  activities_performed: string[];
  issues_found: string[];
  created_at: string;
}

@Component({
  selector: 'app-daily-reports-list',
  templateUrl: './daily-reports-list.component.html',
  styleUrls: ['./daily-reports-list.component.scss'],
})
export class DailyReportsListComponent implements OnInit, OnDestroy {
  reports: DailyReport[] = [];
  loading = false;
  total = 0;
  currentPage = 1;
  pageSize = 20;
  search = '';
  filterStatus = '';
  filterType = '';
  stats: any = null;
  private destroy$ = new Subject<void>();
  private orgId = '';

  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'borrador', label: 'Borrador' },
    { value: 'enviado', label: 'Enviado' },
    { value: 'revisado', label: 'Revisado' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' },
  ];

  typeOptions = [
    { value: '', label: 'Todos' },
    { value: 'bitacora_diaria', label: 'Bitácora Diaria' },
    { value: 'reporte_servicio', label: 'Reporte de Servicio' },
    { value: 'reporte_mantenimiento', label: 'Reporte Mantenimiento' },
    { value: 'reporte_calidad', label: 'Reporte Calidad' },
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
    const params = `?organization_id=${this.orgId}&page=${this.currentPage}&page_size=${this.pageSize}&search=${this.search}&status=${this.filterStatus}&report_type=${this.filterType}`;
    this.api.get<{ reports: DailyReport[]; total: number }>(`/daily-reports${params}`).subscribe({
      next: (res) => { this.reports = res.reports; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; },
    });
    this.api.get<any>(`/daily-reports/stats?organization_id=${this.orgId}`).subscribe({ next: s => this.stats = s });
  }

  onSearch(): void { this.currentPage = 1; this.loadData(); }
  onFilterChange(): void { this.currentPage = 1; this.loadData(); }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = { borrador: 'Borrador', enviado: 'Enviado', revisado: 'Revisado', aprobado: 'Aprobado', rechazado: 'Rechazado' };
    return m[s] || s;
  }
  getStatusClass(s: string): string {
    const m: Record<string, string> = { borrador: 'badge-new', enviado: 'badge-review', revisado: 'badge-approved', aprobado: 'badge-hired', rechazado: 'badge-rejected' };
    return m[s] || '';
  }
  getTypeLabel(t: string): string {
    const m: Record<string, string> = { bitacora_diaria: 'Bitácora Diaria', reporte_servicio: 'Reporte Servicio', reporte_mantenimiento: 'Reporte Mantenimiento', reporte_calidad: 'Reporte Calidad', reporte_incidente: 'Reporte Incidente', otro: 'Otro' };
    return m[t] || t;
  }

  onPageChange(page: number): void { this.currentPage = page; this.loadData(); }

  deleteReport(r: DailyReport): void {
    if (!confirm('¿Está seguro de eliminar este reporte?')) return;
    this.api.delete(`/daily-reports/${r.id}`).subscribe(() => this.loadData());
  }
}
