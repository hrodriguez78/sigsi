import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../store/app.reducer';
import { Candidate, CandidateDocument, CandidateTest, CandidateActivity } from '../../../store/candidates/candidates.actions';
import { selectSelectedCandidate, selectDocuments, selectTests, selectActivities } from '../../../store/candidates/candidates.selectors';
import * as CandActions from '../../../store/candidates/candidates.actions';

@Component({
  selector: 'app-candidate-detail',
  templateUrl: './candidate-detail.component.html',
  styleUrls: ['./candidate-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateDetailComponent implements OnInit, OnDestroy {
  candidate$: Observable<Candidate | null>;
  documents$: Observable<CandidateDocument[]>;
  tests$: Observable<CandidateTest[]>;
  activities$: Observable<CandidateActivity[]>;

  activeTab = 'overview';
  showAddDocDialog = false;
  showAddTestDialog = false;
  showAddActivityDialog = false;
  showStatusDialog = false;

  newDoc = { document_type: 'hoja_de_vida', file_name: '', notes: '' };
  newTest = { test_type: 'psicometrico', test_name: '', max_score: 100, duration_minutes: 60, instructions: '' };
  newActivity = { activity_type: 'nota', description: '' };
  newStatus = '';
  newScore: number | null = null;

  docTypes = [
    { value: 'hoja_de_vida', label: 'Hoja de Vida' },
    { value: 'cedula', label: 'Cédula de Ciudadanía' },
    { value: 'diploma', label: 'Diploma / Título' },
    { value: 'certificado', label: 'Certificado' },
    { value: 'certificado_medico', label: 'Certificado Médico' },
    { value: 'foto', label: 'Foto' },
    { value: 'referencia', label: 'Referencia Laboral' },
    { value: 'otro', label: 'Otro' },
  ];

  testTypes = [
    { value: 'psicometrico', label: 'Psicométrico' },
    { value: 'coeficiente_intelectual', label: 'Coeficiente Intelectual' },
    { value: 'tecnico', label: 'Técnico' },
    { value: 'personalidad', label: 'Personalidad' },
    { value: 'ingles', label: 'Inglés' },
    { value: 'otro', label: 'Otro' },
  ];

  activityTypes = [
    { value: 'nota', label: 'Nota' },
    { value: 'llamada', label: 'Llamada' },
    { value: 'email', label: 'Email' },
    { value: 'entrevista', label: 'Entrevista' },
    { value: 'documento', label: 'Documento' },
    { value: 'estado', label: 'Cambio de Estado' },
  ];

  allStatuses = [
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'en_revision', label: 'En Revisión' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' },
    { value: 'contratado', label: 'Contratado' },
    { value: 'retirado', label: 'Retirado' },
  ];

  private destroy$ = new Subject<void>();
  private candidateId = '';

  constructor(private route: ActivatedRoute, private store: Store<AppState>) {
    this.candidate$ = this.store.select(selectSelectedCandidate);
    this.documents$ = this.store.select(selectDocuments);
    this.tests$ = this.store.select(selectTests);
    this.activities$ = this.store.select(selectActivities);
  }

  ngOnInit(): void {
    this.candidateId = this.route.snapshot.paramMap.get('id') || '';
    if (this.candidateId) {
      this.store.dispatch(CandActions.loadCandidate({ id: this.candidateId }));
      this.store.dispatch(CandActions.loadDocuments({ candidateId: this.candidateId }));
      this.store.dispatch(CandActions.loadTests({ candidateId: this.candidateId }));
      this.store.dispatch(CandActions.loadActivities({ candidateId: this.candidateId }));
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  setTab(tab: string): void { this.activeTab = tab; }

  addDocument(): void {
    if (!this.newDoc.file_name) return;
    this.store.dispatch(CandActions.addDocument({ candidateId: this.candidateId, data: this.newDoc as any }));
    this.newDoc = { document_type: 'hoja_de_vida', file_name: '', notes: '' };
    this.showAddDocDialog = false;
  }

  verifyDocument(docId: string): void {
    this.store.dispatch(CandActions.verifyDocument({ docId }));
  }

  addTest(): void {
    if (!this.newTest.test_name) return;
    this.store.dispatch(CandActions.addTest({ candidateId: this.candidateId, data: this.newTest as any }));
    this.newTest = { test_type: 'psicometrico', test_name: '', max_score: 100, duration_minutes: 60, instructions: '' };
    this.showAddTestDialog = false;
  }

  updateTestScore(testId: string, score: number): void {
    this.store.dispatch(CandActions.updateTest({ testId, data: { score, status: 'completado' } as any }));
  }

  addActivity(): void {
    if (!this.newActivity.description) return;
    this.store.dispatch(CandActions.addActivity({ candidateId: this.candidateId, data: this.newActivity }));
    this.newActivity = { activity_type: 'nota', description: '' };
    this.showAddActivityDialog = false;
  }

  updateStatus(): void {
    const data: any = {};
    if (this.newStatus) data.status = this.newStatus;
    if (this.newScore !== null) data.score = this.newScore;
    this.store.dispatch(CandActions.updateCandidate({ id: this.candidateId, data }));
    this.showStatusDialog = false;
  }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = { nuevo: 'Nuevo', en_revision: 'En Revisión', aprobado: 'Aprobado', rechazado: 'Rechazado', contratado: 'Contratado', retirado: 'Retirado' };
    return m[s] || s;
  }
  getStatusClass(s: string): string {
    const m: Record<string, string> = { nuevo: 'badge-new', en_revision: 'badge-review', aprobado: 'badge-approved', rechazado: 'badge-rejected', contratado: 'badge-hired', retirado: 'badge-withdrawn' };
    return m[s] || '';
  }
  getDocTypeLabel(t: string): string { return this.docTypes.find(d => d.value === t)?.label || t; }
  getTestTypeLabel(t: string): string { return this.testTypes.find(d => d.value === t)?.label || t; }
  getActivityIcon(t: string): string {
    const m: Record<string, string> = { nota: 'note', llamada: 'phone', email: 'email', entrevista: 'event', documento: 'attach_file', estado: 'autorenew' };
    return m[t] || 'info';
  }
}
