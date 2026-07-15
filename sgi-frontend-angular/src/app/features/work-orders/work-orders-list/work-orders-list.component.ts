import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { selectSelectedOrganization } from '../../../store/organizations/organizations.selectors';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.reducer';

interface WorkOrder {
  id: string;
  order_number: string;
  title: string;
  order_type: string;
  priority: string;
  status: string;
  assigned_to_name: string;
  location: string;
  scheduled_date: string;
  due_date: string;
  comments_count: number;
  created_at: string;
}

@Component({
  selector: 'app-work-orders-list',
  templateUrl: './work-orders-list.component.html',
  styleUrls: ['./work-orders-list.component.scss'],
})
export class WorkOrdersListComponent implements OnInit, OnDestroy {
  workOrders: WorkOrder[] = [];
  loading = false;
  total = 0;
  currentPage = 1;
  pageSize = 20;
  search = '';
  filterStatus = '';
  filterPriority = '';
  filterType = '';
  showStats = true;
  stats: any = null;
  private destroy$ = new Subject<void>();
  private orgId = '';

  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'programada', label: 'Programada' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'en_espera', label: 'En Espera' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'verificada', label: 'Verificada' },
  ];

  priorityOptions = [
    { value: '', label: 'Todas' },
    { value: 'critica', label: 'Crítica' },
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Media' },
    { value: 'baja', label: 'Baja' },
  ];

  typeOptions = [
    { value: '', label: 'Todos' },
    { value: 'mantenimiento_preventivo', label: 'Mant. Preventivo' },
    { value: 'mantenimiento_correctivo', label: 'Mant. Correctivo' },
    { value: 'aseo_interior', label: 'Aseo Interior' },
    { value: 'aseo_exterior', label: 'Aseo Exterior' },
    { value: 'aseo_industrial', label: 'Aseo Industrial' },
    { value: 'emergencia', label: 'Emergencia' },
    { value: 'instalacion', label: 'Instalación' },
    { value: 'otro', label: 'Otro' },
  ];

  constructor(private api: ApiService, private store: Store<AppState>) {}

  ngOnInit(): void {
    this.store.select(selectSelectedOrganization).pipe(takeUntil(this.destroy$)).subscribe(org => {
      if (org) {
        this.orgId = org.id;
        this.loadData();
      }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadData(): void {
    if (!this.orgId) return;
    this.loading = true;
    const params = `?organization_id=${this.orgId}&page=${this.currentPage}&page_size=${this.pageSize}&search=${this.search}&status=${this.filterStatus}&priority=${this.filterPriority}&order_type=${this.filterType}`;
    this.api.get<{ work_orders: WorkOrder[]; total: number }>(`/work-orders${params}`).subscribe({
      next: (res) => { this.workOrders = res.work_orders; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; },
    });
    this.api.get<any>(`/work-orders/stats?organization_id=${this.orgId}`).subscribe({
      next: (s) => { this.stats = s; },
    });
  }

  onSearch(): void { this.currentPage = 1; this.loadData(); }
  onFilterChange(): void { this.currentPage = 1; this.loadData(); }
  onPageChange(page: number): void { this.currentPage = page; this.loadData(); }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = { pendiente: 'Pendiente', programada: 'Programada', en_progreso: 'En Progreso', en_espera: 'En Espera', completada: 'Completada', cancelada: 'Cancelada', verificada: 'Verificada' };
    return m[s] || s;
  }
  getStatusClass(s: string): string {
    const m: Record<string, string> = { pendiente: 'badge-new', programada: 'badge-review', en_progreso: 'badge-approved', completada: 'badge-hired', cancelada: 'badge-rejected', verificada: 'badge-approved' };
    return m[s] || '';
  }
  getPriorityLabel(p: string): string {
    const m: Record<string, string> = { critica: 'Crítica', alta: 'Alta', media: 'Media', baja: 'Baja' };
    return m[p] || p;
  }
  getPriorityClass(p: string): string {
    const m: Record<string, string> = { critica: 'badge-rejected', alta: 'badge-review', media: 'badge-new', baja: 'badge-approved' };
    return m[p] || '';
  }
  getTypeLabel(t: string): string {
    const m: Record<string, string> = { mantenimiento_preventivo: 'Mant. Preventivo', mantenimiento_correctivo: 'Mant. Correctivo', aseo_interior: 'Aseo Interior', aseo_exterior: 'Aseo Exterior', aseo_industrial: 'Aseo Industrial', emergencia: 'Emergencia', instalacion: 'Instalación', otro: 'Otro' };
    return m[t] || t;
  }

  deleteWorkOrder(wo: WorkOrder): void {
    if (!confirm('¿Está seguro de eliminar esta orden de trabajo?')) return;
    this.api.delete(`/work-orders/${wo.id}`).subscribe(() => this.loadData());
  }
}
