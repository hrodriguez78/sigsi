import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../store/app.reducer';
import { Candidate, PipelineStats } from '../../../store/candidates/candidates.actions';
import {
  selectCandidates, selectCandidatesLoading, selectCandidatesTotal, selectPipelineStats
} from '../../../store/candidates/candidates.selectors';
import { selectSelectedOrganization } from '../../../store/organizations/organizations.selectors';
import { selectProcesses } from '../../../store/processes/processes.selectors';
import { Process } from '../../../core/models';
import * as CandActions from '../../../store/candidates/candidates.actions';
import * as ProcActions from '../../../store/processes/processes.actions';

@Component({
  selector: 'app-candidates-list',
  templateUrl: './candidates-list.component.html',
  styleUrls: ['./candidates-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidatesListComponent implements OnInit, OnDestroy {
  candidates$: Observable<Candidate[]>;
  loading$: Observable<boolean>;
  total$: Observable<number>;
  stats$: Observable<PipelineStats | null>;
  processes$: Observable<Process[]>;

  search = '';
  filterStatus = '';
  filterProcess = '';
  currentPage = 1;
  pageSize = 20;
  showDeleteDialog = false;
  showCreateDialog = false;
  candidateToDelete: Candidate | null = null;
  private destroy$ = new Subject<void>();
  private orgId = '';

  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'en_revision', label: 'En Revisión' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' },
    { value: 'contratado', label: 'Contratado' },
    { value: 'retirado', label: 'Retirado' },
  ];

  constructor(private store: Store<AppState>) {
    this.candidates$ = this.store.select(selectCandidates);
    this.loading$ = this.store.select(selectCandidatesLoading);
    this.total$ = this.store.select(selectCandidatesTotal);
    this.stats$ = this.store.select(selectPipelineStats);
    this.processes$ = this.store.select(selectProcesses);
  }

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
    this.store.dispatch(CandActions.loadCandidates({
      organizationId: this.orgId, page: this.currentPage, pageSize: this.pageSize,
      search: this.search, status: this.filterStatus, processId: this.filterProcess,
    }));
    this.store.dispatch(CandActions.loadPipelineStats({ organizationId: this.orgId }));
    this.store.dispatch(ProcActions.loadProcesses({ organizationId: this.orgId, page: 1, pageSize: 100 }));
  }

  onSearch(): void { this.currentPage = 1; this.loadData(); }
  onFilterChange(): void { this.currentPage = 1; this.loadData(); }
  onPageChange(page: number): void { this.currentPage = page; this.loadData(); }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = { nuevo: 'Nuevo', en_revision: 'En Revisión', aprobado: 'Aprobado', rechazado: 'Rechazado', contratado: 'Contratado', retirado: 'Retirado' };
    return m[s] || s;
  }
  getStatusClass(s: string): string {
    const m: Record<string, string> = { nuevo: 'badge-new', en_revision: 'badge-review', aprobado: 'badge-approved', rechazado: 'badge-rejected', contratado: 'badge-hired', retirado: 'badge-withdrawn' };
    return m[s] || '';
  }
  getSourceLabel(s: string): string {
    const m: Record<string, string> = { linkedin: 'LinkedIn', portal: 'Portal Web', referral: 'Referido', email: 'Email', otro: 'Otro' };
    return m[s] || s || '-';
  }

  confirmDelete(c: Candidate): void { this.candidateToDelete = c; this.showDeleteDialog = true; }
  onDeleteConfirm(): void {
    if (this.candidateToDelete) {
      this.store.dispatch(CandActions.deleteCandidate({ id: this.candidateToDelete.id }));
      this.showDeleteDialog = false; this.candidateToDelete = null;
    }
  }
  onDeleteCancel(): void { this.showDeleteDialog = false; this.candidateToDelete = null; }
}
