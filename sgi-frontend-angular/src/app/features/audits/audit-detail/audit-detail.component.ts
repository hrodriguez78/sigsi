import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  Audit,
  AuditFinding,
  AuditCorrectiveAction,
  AuditChecklistItem,
} from '../../../core/models';
import {
  loadAuditById,
  loadAuditFindings,
  addAuditFinding,
  loadAuditChecklist,
  addAuditChecklistItem,
  loadAuditCorrectiveActions,
  addAuditCorrectiveAction,
  updateAuditCorrectiveAction,
  deleteAudit,
} from '../../../store/audits/audits.actions';
import {
  selectCurrentAudit,
  selectDetailLoading,
  selectAuditFindings,
  selectAuditChecklist,
  selectAuditCorrectiveActions,
} from '../../../store/audits/audits.selectors';

@Component({
  selector: 'app-audit-detail',
  templateUrl: './audit-detail.component.html',
  styleUrls: ['./audit-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditDetailComponent implements OnInit, OnDestroy {
  audit: Audit | null = null;
  findings: AuditFinding[] = [];
  correctiveActions: AuditCorrectiveAction[] = [];
  checklist: AuditChecklistItem[] = [];
  loading = false;

  showFindingForm = false;
  showChecklistForm = false;
  showCorrectiveActionForm = false;
  showDeleteDialog = false;

  findingForm: FormGroup;
  checklistForm: FormGroup;
  correctiveActionForm: FormGroup;

  selectedFindingId = '';
  activeTab = 'info';

  private auditId = '';
  private destroy$ = new Subject<void>();

  findingTypeOptions = [
    { value: 'no_conformidad', label: 'No Conformidad' },
    { value: 'observacion', label: 'Observación' },
    { value: 'oportunidad_mejora', label: 'Oportunidad de Mejora' },
    { value: 'buena_practica', label: 'Buena Práctica' },
  ];

  severityOptions = [
    { value: 'bajo', label: 'Bajo' },
    { value: 'medio', label: 'Medio' },
    { value: 'alto', label: 'Alto' },
    { value: 'critico', label: 'Crítico' },
  ];

  checklistStatusOptions = [
    { value: 'cumple', label: 'Cumple' },
    { value: 'no_cumple', label: 'No Cumple' },
    { value: 'no_aplicable', label: 'No Aplicable' },
    { value: 'pendiente', label: 'Pendiente' },
  ];

  correctiveActionStatusOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completada', label: 'Completada' },
    { value: 'verificada', label: 'Verificada' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.findingForm = this.fb.group({
      title: ['', Validators.required],
      finding_type: ['observacion', Validators.required],
      severity: ['medio', Validators.required],
      description: ['', Validators.required],
      evidence: [''],
      requirement: [''],
    });

    this.checklistForm = this.fb.group({
      control_reference: ['', Validators.required],
      description: ['', Validators.required],
      status: ['pendiente', Validators.required],
      observation: [''],
    });

    this.correctiveActionForm = this.fb.group({
      finding_id: ['', Validators.required],
      action: ['', Validators.required],
      responsible: ['', Validators.required],
      deadline: ['', Validators.required],
      status: ['pendiente', Validators.required],
      evidence: [''],
    });
  }

  ngOnInit(): void {
    this.auditId = this.route.snapshot.paramMap.get('id') || '';
    if (this.auditId) {
      this.store.dispatch(loadAuditById({ id: this.auditId }));
      this.store.dispatch(loadAuditFindings({ auditId: this.auditId }));
      this.store.dispatch(loadAuditChecklist({ auditId: this.auditId }));
      this.store.dispatch(loadAuditCorrectiveActions({ auditId: this.auditId }));
    }

    this.store
      .select(selectCurrentAudit)
      .pipe(takeUntil(this.destroy$))
      .subscribe(audit => {
        this.audit = audit;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectDetailLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectAuditFindings)
      .pipe(takeUntil(this.destroy$))
      .subscribe(findings => {
        this.findings = findings;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectAuditChecklist)
      .pipe(takeUntil(this.destroy$))
      .subscribe(checklist => {
        this.checklist = checklist;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectAuditCorrectiveActions)
      .pipe(takeUntil(this.destroy$))
      .subscribe(actions => {
        this.correctiveActions = actions;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  goBack(): void {
    this.router.navigate(['/audits']);
  }

  editAudit(): void {
    this.router.navigate(['/audits', this.auditId, 'edit']);
  }

  confirmDelete(): void {
    this.showDeleteDialog = true;
    this.cdr.markForCheck();
  }

  onDeleteConfirm(): void {
    this.store.dispatch(deleteAudit({ id: this.auditId }));
    this.showDeleteDialog = false;
    this.router.navigate(['/audits']);
  }

  onDeleteCancel(): void {
    this.showDeleteDialog = false;
    this.cdr.markForCheck();
  }

  // Findings
  openFindingForm(): void {
    this.showFindingForm = true;
    this.findingForm.reset({ finding_type: 'observacion', severity: 'medio' });
    this.cdr.markForCheck();
  }

  closeFindingForm(): void {
    this.showFindingForm = false;
    this.cdr.markForCheck();
  }

  submitFinding(): void {
    if (this.findingForm.valid) {
      this.store.dispatch(
        addAuditFinding({ auditId: this.auditId, data: this.findingForm.value })
      );
      this.showFindingForm = false;
      this.cdr.markForCheck();
    }
  }

  // Checklist
  onChecklistDrop(event: CdkDragDrop<AuditChecklistItem[]>): void {
    moveItemInArray(this.checklist, event.previousIndex, event.currentIndex);
    this.cdr.markForCheck();
  }

  openChecklistForm(): void {
    this.showChecklistForm = true;
    this.checklistForm.reset({ status: 'pendiente' });
    this.cdr.markForCheck();
  }

  closeChecklistForm(): void {
    this.showChecklistForm = false;
    this.cdr.markForCheck();
  }

  submitChecklistItem(): void {
    if (this.checklistForm.valid) {
      this.store.dispatch(
        addAuditChecklistItem({ auditId: this.auditId, data: this.checklistForm.value })
      );
      this.showChecklistForm = false;
      this.cdr.markForCheck();
    }
  }

  // Corrective Actions
  openCorrectiveActionForm(findingId?: string): void {
    this.showCorrectiveActionForm = true;
    this.correctiveActionForm.reset({ finding_id: findingId || '', status: 'pendiente' });
    if (findingId) {
      this.correctiveActionForm.patchValue({ finding_id: findingId });
    }
    this.cdr.markForCheck();
  }

  closeCorrectiveActionForm(): void {
    this.showCorrectiveActionForm = false;
    this.cdr.markForCheck();
  }

  submitCorrectiveAction(): void {
    if (this.correctiveActionForm.valid) {
      this.store.dispatch(
        addAuditCorrectiveAction({
          auditId: this.auditId,
          data: this.correctiveActionForm.value,
        })
      );
      this.showCorrectiveActionForm = false;
      this.cdr.markForCheck();
    }
  }

  updateCorrectiveActionStatus(actionId: string, status: string): void {
    this.store.dispatch(
      updateAuditCorrectiveAction({ id: actionId, data: { status: status as any } })
    );
  }

  // Labels
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

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      planificada: 'status-planificada',
      en_curso: 'status-en-curso',
      completada: 'status-completada',
      reporte_cerrado: 'status-reporte-cerrado',
    };
    return map[status] || '';
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

  getFindingTypeLabel(type: string): string {
    const map: Record<string, string> = {
      no_conformidad: 'No Conformidad',
      observacion: 'Observación',
      oportunidad_mejora: 'Oportunidad de Mejora',
      buena_practica: 'Buena Práctica',
    };
    return map[type] || type;
  }

  getFindingTypeBadgeClass(type: string): string {
    const map: Record<string, string> = {
      no_conformidad: 'finding-nc',
      observacion: 'finding-obs',
      oportunidad_mejora: 'finding-om',
      buena_practica: 'finding-bp',
    };
    return map[type] || '';
  }

  getSeverityLabel(severity: string): string {
    const map: Record<string, string> = {
      bajo: 'Bajo',
      medio: 'Medio',
      alto: 'Alto',
      critico: 'Crítico',
    };
    return map[severity] || severity;
  }

  getSeverityBadgeClass(severity: string): string {
    const map: Record<string, string> = {
      bajo: 'severity-bajo',
      medio: 'severity-medio',
      alto: 'severity-alto',
      critico: 'severity-critico',
    };
    return map[severity] || '';
  }

  getChecklistStatusLabel(status: string): string {
    const map: Record<string, string> = {
      cumple: 'Cumple',
      no_cumple: 'No Cumple',
      no_aplicable: 'No Aplicable',
      pendiente: 'Pendiente',
    };
    return map[status] || status;
  }

  getChecklistStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      cumple: 'check-cumple',
      no_cumple: 'check-no-cumple',
      no_aplicable: 'check-no-aplicable',
      pendiente: 'check-pendiente',
    };
    return map[status] || '';
  }

  getCorrectiveActionStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      en_progreso: 'En Progreso',
      completada: 'Completada',
      verificada: 'Verificada',
    };
    return map[status] || status;
  }

  getCorrectiveActionStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      pendiente: 'ca-pendiente',
      en_progreso: 'ca-en-progreso',
      completada: 'ca-completada',
      verificada: 'ca-verificada',
    };
    return map[status] || '';
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getFindingTitleById(findingId: string): string {
    const finding = this.findings.find(f => f.id === findingId);
    return finding ? finding.title : '-';
  }

  get compliancePercentage(): number {
    if (this.checklist.length === 0) return 0;
    const compliant = this.checklist.filter(c => c.status === 'cumple').length;
    return Math.round((compliant / this.checklist.length) * 100);
  }

  get nonConformityCount(): number {
    return this.findings.filter(f => f.finding_type === 'no_conformidad').length;
  }
}
