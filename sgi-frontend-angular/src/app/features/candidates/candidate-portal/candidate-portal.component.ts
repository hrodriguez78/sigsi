import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { AppState } from '../../../store/app.reducer';
import { Candidate, CandidateDocument, CandidateTest, CandidateActivity } from '../../../store/candidates/candidates.actions';
import { selectSelectedCandidate, selectDocuments, selectTests, selectActivities } from '../../../store/candidates/candidates.selectors';
import { selectUser } from '../../../store/auth/auth.selectors';
import * as CandActions from '../../../store/candidates/candidates.actions';

@Component({
  selector: 'app-candidate-portal',
  templateUrl: './candidate-portal.component.html',
  styleUrls: ['./candidate-portal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidatePortalComponent implements OnInit, OnDestroy {
  candidate$: Observable<Candidate | null>;
  documents$: Observable<CandidateDocument[]>;
  tests$: Observable<CandidateTest[]>;
  activities$: Observable<CandidateActivity[]>;

  activeTab = 'status';
  showUploadDialog = false;
  newDoc = { document_type: 'hoja_de_vida', file_name: '', notes: '' };

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

  private destroy$ = new Subject<void>();
  private candidateId = '';

  constructor(private store: Store<AppState>) {
    this.candidate$ = this.store.select(selectSelectedCandidate);
    this.documents$ = this.store.select(selectDocuments);
    this.tests$ = this.store.select(selectTests);
    this.activities$ = this.store.select(selectActivities);
  }

  ngOnInit(): void {
    // In a real app, the candidate would be loaded from their auth session
    // For now, we load the first candidate of the current user's org
    this.store.select(selectUser).pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        // The candidate portal would use a different API endpoint
        // that loads candidates by email match. For demo, we use the same store.
      }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadCandidate(id: string): void {
    this.candidateId = id;
    this.store.dispatch(CandActions.loadCandidate({ id }));
    this.store.dispatch(CandActions.loadDocuments({ candidateId: id }));
    this.store.dispatch(CandActions.loadTests({ candidateId: id }));
    this.store.dispatch(CandActions.loadActivities({ candidateId: id }));
  }

  setTab(tab: string): void { this.activeTab = tab; }

  uploadDocument(): void {
    if (!this.newDoc.file_name) return;
    this.store.dispatch(CandActions.addDocument({ candidateId: this.candidateId, data: this.newDoc as any }));
    this.newDoc = { document_type: 'hoja_de_vida', file_name: '', notes: '' };
    this.showUploadDialog = false;
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
  getTestTypeLabel(t: string): string {
    const m: Record<string, string> = { psicometrico: 'Psicométrico', coeficiente_intelectual: 'CI', tecnico: 'Técnico', personalidad: 'Personalidad', ingles: 'Inglés', otro: 'Otro' };
    return m[t] || t;
  }
}
