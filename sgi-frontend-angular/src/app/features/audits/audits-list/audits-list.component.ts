import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Audit } from '../../../core/models';
import { loadAudits, deleteAudit } from '../../../store/audits/audits.actions';
import { selectAllAudits, selectAuditsLoading, selectAuditsTotal } from '../../../store/audits/audits.selectors';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-audits-list',
  templateUrl: './audits-list.component.html',
  styleUrls: ['./audits-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditsListComponent implements OnInit, OnDestroy {
  audits: Audit[] = [];
  loading = false;
  total = 0;

  currentPage = 1;
  pageSize = 20;

  filters = {
    audit_type: '',
    status: '',
    search: '',
  };

  auditTypeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'interna', label: 'Interna' },
    { value: 'externa', label: 'Externa' },
    { value: 'proveedor', label: 'Proveedor' },
    { value: 'autoevaluacion', label: 'Autoevaluación' },
  ];

  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'planificada', label: 'Planificada' },
    { value: 'en_curso', label: 'En Curso' },
    { value: 'completada', label: 'Completada' },
    { value: 'reporte_cerrado', label: 'Reporte Cerrado' },
  ];

  showDeleteDialog = false;
  auditToDelete: Audit | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private exportService: ExportService,
  ) {}

  ngOnInit(): void {
    this.loadAudits();

    this.store
      .select(selectAllAudits)
      .pipe(takeUntil(this.destroy$))
      .subscribe(audits => {
        this.audits = audits;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectAuditsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectAuditsTotal)
      .pipe(takeUntil(this.destroy$))
      .subscribe(total => {
        this.total = total;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAudits(): void {
    this.store.dispatch(
      loadAudits({
        organizationId: '',
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.filters.search || undefined,
        auditType: this.filters.audit_type || undefined,
        status: this.filters.status || undefined,
      })
    );
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadAudits();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadAudits();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAudits();
  }

  exportData(): void {
    this.exportService.exportModule('audits');
  }

  viewAudit(id: string): void {
    this.router.navigate(['/audits', id]);
  }

  editAudit(id: string): void {
    this.router.navigate(['/audits', id, 'edit']);
  }

  confirmDelete(audit: Audit): void {
    this.auditToDelete = audit;
    this.showDeleteDialog = true;
  }

  onDeleteConfirm(): void {
    if (this.auditToDelete) {
      this.store.dispatch(deleteAudit({ id: this.auditToDelete.id }));
      this.showDeleteDialog = false;
      this.auditToDelete = null;
    }
  }

  onDeleteCancel(): void {
    this.showDeleteDialog = false;
    this.auditToDelete = null;
  }

  getAuditTypeBadgeClass(type: string): string {
    const map: Record<string, string> = {
      interna: 'badge-interna',
      externa: 'badge-externa',
      proveedor: 'badge-proveedor',
      autoevaluacion: 'badge-autoevaluacion',
    };
    return map[type] || '';
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      planificada: 'status-planificada',
      en_curso: 'status-en-curso',
      completada: 'status-completada',
      reporte_cerrado: 'status-reporte-cerrado',
    };
    return map[status] || '';
  }

  getAuditTypeLabel(type: string): string {
    const map: Record<string, string> = {
      interna: 'Interna',
      externa: 'Externa',
      proveedor: 'Proveedor',
      autoevaluacion: 'Autoevaluación',
    };
    return map[type] || type;
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      planificada: 'Planificada',
      en_curso: 'En Curso',
      completada: 'Completada',
      reporte_cerrado: 'Reporte Cerrado',
    };
    return map[status] || status;
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getDateRange(audit: Audit): string {
    const start = audit.start_date ? this.formatDate(audit.start_date) : this.formatDate(audit.planned_date);
    const end = audit.end_date ? this.formatDate(audit.end_date) : '-';
    return `${start} → ${end}`;
  }
}
