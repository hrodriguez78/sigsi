import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Document } from '../../../core/models';
import {
  selectDocuments,
  selectDocumentsLoading,
  selectDocumentsTotal,
} from '../../../store/documents/documents.selectors';
import {
  loadDocuments,
  deleteDocument,
  publishDocument,
  archiveDocument,
} from '../../../store/documents/documents.actions';
import { selectSelectedOrganization } from '../../../store/organizations/organizations.selectors';
import * as OrgActions from '../../../store/organizations/organizations.actions';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-documents-list',
  templateUrl: './documents-list.component.html',
  styleUrls: ['./documents-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsListComponent implements OnInit, OnDestroy {
  documents: Document[] = [];
  total = 0;
  loading = false;
  currentPage = 1;
  pageSize = 20;
  search = '';
  filterType = '';
  filterStatus = '';

  readonly documentTypes = [
    { value: '', label: 'Todos los tipos' },
    { value: 'politica', label: 'Política' },
    { value: 'procedimiento', label: 'Procedimiento' },
    { value: 'lineamiento', label: 'Lineamiento' },
    { value: 'manual', label: 'Manual' },
    { value: 'formato', label: 'Formato' },
    { value: 'registro', label: 'Registro' },
    { value: 'plan', label: 'Plan' },
    { value: 'reporte', label: 'Reporte' },
    { value: 'otro', label: 'Otro' },
  ];

  readonly statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'borrador', label: 'Borrador' },
    { value: 'en_revision', label: 'En Revisión' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'publicado', label: 'Publicado' },
    { value: 'archivado', label: 'Archivado' },
    { value: 'obsoleto', label: 'Obsoleto' },
  ];

  readonly statusBadgeMap: Record<string, { label: string; class: string }> = {
    borrador: { label: 'Borrador', class: 'badge badge--gray' },
    en_revision: { label: 'En Revisión', class: 'badge badge--blue' },
    aprobado: { label: 'Aprobado', class: 'badge badge--green' },
    publicado: { label: 'Publicado', class: 'badge badge--darkgreen' },
    archivado: { label: 'Archivado', class: 'badge badge--orange' },
    obsoleto: { label: 'Obsoleto', class: 'badge badge--red' },
  };

  readonly typeBadgeMap: Record<string, { label: string; class: string }> = {
    politica: { label: 'Política', class: 'badge badge--type-politica' },
    procedimiento: { label: 'Procedimiento', class: 'badge badge--type-procedimiento' },
    lineamiento: { label: 'Lineamiento', class: 'badge badge--type-lineamiento' },
    manual: { label: 'Manual', class: 'badge badge--type-manual' },
    formato: { label: 'Formato', class: 'badge badge--type-formato' },
    registro: { label: 'Registro', class: 'badge badge--type-registro' },
    plan: { label: 'Plan', class: 'badge badge--type-plan' },
    reporte: { label: 'Reporte', class: 'badge badge--type-reporte' },
    otro: { label: 'Otro', class: 'badge badge--type-otro' },
  };

  private destroy$ = new Subject<void>();
  private currentOrgId = '';

  constructor(
    private store: Store,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private exportService: ExportService,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(OrgActions.loadOrganizations({ page: 1, pageSize: 50 }));

    this.store
      .select(selectDocuments)
      .pipe(takeUntil(this.destroy$))
      .subscribe((docs) => {
        this.documents = docs;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectDocumentsTotal)
      .pipe(takeUntil(this.destroy$))
      .subscribe((total) => {
        this.total = total;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectDocumentsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.loading = loading;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectSelectedOrganization)
      .pipe(takeUntil(this.destroy$))
      .subscribe((org) => {
        this.currentOrgId = org?.id || '';
        this.loadDocuments();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDocuments(): void {
    this.store.dispatch(
      loadDocuments({
        organizationId: this.currentOrgId,
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.search,
        documentType: this.filterType || undefined,
        status: this.filterStatus || undefined,
      })
    );
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadDocuments();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadDocuments();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDocuments();
  }

  exportData(): void {
    this.exportService.exportModule('documents');
  }

  viewDocument(doc: Document): void {
    this.router.navigate(['/documents', doc.id]);
  }

  editDocument(doc: Document): void {
    this.router.navigate(['/documents', doc.id, 'edit']);
  }

  publishDoc(doc: Document): void {
    this.store.dispatch(publishDocument({ id: doc.id }));
  }

  archiveDoc(doc: Document): void {
    this.store.dispatch(archiveDocument({ id: doc.id }));
  }

  deleteDoc(doc: Document): void {
    if (confirm(`¿Eliminar el documento "${doc.title}"?`)) {
      this.store.dispatch(deleteDocument({ id: doc.id }));
    }
  }

  getStatusLabel(status: string): string {
    return this.statusBadgeMap[status]?.label || status;
  }

  getStatusClass(status: string): string {
    return this.statusBadgeMap[status]?.class || 'badge';
  }

  getTypeLabel(type: string): string {
    return this.typeBadgeMap[type]?.label || type;
  }

  getTypeClass(type: string): string {
    return this.typeBadgeMap[type]?.class || 'badge';
  }
}
