import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { DocumentDetail, DocumentVersion, DocumentApproval } from '../../../core/models';
import { selectSelectedDocument, selectDocumentsLoading } from '../../../store/documents/documents.selectors';
import {
  loadDocument,
  publishDocument,
  archiveDocument,
  updateDocument,
} from '../../../store/documents/documents.actions';

@Component({
  selector: 'app-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  document: DocumentDetail | null = null;
  loading = false;
  documentId = '';

  readonly workflowSteps = ['borrador', 'en_revision', 'aprobado', 'publicado'];

  readonly statusLabels: Record<string, string> = {
    borrador: 'Borrador',
    en_revision: 'En Revisión',
    aprobado: 'Aprobado',
    publicado: 'Publicado',
    archivado: 'Archivado',
    obsoleto: 'Obsoleto',
  };

  readonly typeLabels: Record<string, string> = {
    politica: 'Política',
    procedimiento: 'Procedimiento',
    lineamiento: 'Lineamiento',
    manual: 'Manual',
    formato: 'Formato',
    registro: 'Registro',
    plan: 'Plan',
    reporte: 'Reporte',
    otro: 'Otro',
  };

  readonly approvalStatusLabels: Record<string, string> = {
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    pendiente: 'Pendiente',
  };

  readonly approvalStatusClasses: Record<string, string> = {
    aprobado: 'badge badge--green',
    rechazado: 'badge badge--red',
    pendiente: 'badge badge--gray',
  };

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.documentId = this.route.snapshot.paramMap.get('id') || '';

    this.store
      .select(selectSelectedDocument)
      .pipe(takeUntil(this.destroy$))
      .subscribe((doc) => {
        this.document = doc;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectDocumentsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.loading = loading;
        this.cdr.markForCheck();
      });

    if (this.documentId) {
      this.store.dispatch(loadDocument({ id: this.documentId }));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStepIndex(status: string): number {
    return this.workflowSteps.indexOf(status);
  }

  isStepCompleted(status: string): boolean {
    if (!this.document) return false;
    const currentIdx = this.getStepIndex(this.document.status);
    const stepIdx = this.getStepIndex(status);
    return stepIdx <= currentIdx;
  }

  isStepActive(status: string): boolean {
    return this.document?.status === status;
  }

  editDocument(): void {
    this.router.navigate(['/documents', this.documentId, 'edit']);
  }

  submitForReview(): void {
    if (this.document) {
      this.store.dispatch(
        updateDocument({ id: this.documentId, data: { status: 'en_revision' } })
      );
    }
  }

  approveDocument(): void {
    if (this.document) {
      this.store.dispatch(
        updateDocument({ id: this.documentId, data: { status: 'aprobado' } })
      );
    }
  }

  rejectDocument(): void {
    if (this.document) {
      this.store.dispatch(
        updateDocument({ id: this.documentId, data: { status: 'borrador' } })
      );
    }
  }

  publishDocument(): void {
    this.store.dispatch(publishDocument({ id: this.documentId }));
  }

  archiveDocument(): void {
    this.store.dispatch(archiveDocument({ id: this.documentId }));
  }

  goBack(): void {
    this.router.navigate(['/documents']);
  }
}
