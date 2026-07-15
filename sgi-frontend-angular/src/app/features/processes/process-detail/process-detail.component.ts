import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';

import { Process } from '../../../core/models';
import { AppState } from '../../../store/app.reducer';
import {
  selectProcesses,
  selectProcessesLoading,
} from '../../../store/processes/processes.selectors';
import * as ProcessActions from '../../../store/processes/processes.actions';

@Component({
  selector: 'app-process-detail',
  templateUrl: './process-detail.component.html',
  styleUrls: ['./process-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessDetailComponent implements OnInit, OnDestroy {
  process$: Observable<Process | undefined>;
  loading$: Observable<boolean>;
  children$: Observable<Process[]>;
  currentProcess: Process | null = null;

  showDeleteDialog = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.process$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id') || '';
        this.store.dispatch(ProcessActions.setSelectedProcess({ id }));
        return this.store.select(selectProcesses).pipe(
          map((processes) => processes.find((p) => p.id === id))
        );
      }),
      takeUntil(this.destroy$)
    );

    this.loading$ = this.store.select(selectProcessesLoading);

    this.children$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id') || '';
        return this.store.select(selectProcesses).pipe(
          map((processes) => processes.filter((p) => p.parent_id === id))
        );
      }),
      takeUntil(this.destroy$)
    );
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.dispatch(
        ProcessActions.loadProcesses({
          organizationId: '',
          page: 1,
          pageSize: 100,
        })
      );
    }

    this.process$.pipe(takeUntil(this.destroy$)).subscribe((process) => {
      this.currentProcess = process || null;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEdit(process: Process): void {
    this.router.navigate(['/processes', process.id, 'edit']);
  }

  confirmDelete(): void {
    this.showDeleteDialog = true;
  }

  onDeleteConfirm(): void {
    if (this.currentProcess) {
      this.store.dispatch(ProcessActions.deleteProcess({ id: this.currentProcess.id }));
      this.showDeleteDialog = false;
      this.router.navigate(['/processes']);
    }
  }

  onDeleteCancel(): void {
    this.showDeleteDialog = false;
  }

  onBack(): void {
    this.router.navigate(['/processes']);
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      estrategico: 'Estratégico',
      tactico: 'Táctico',
      operativo: 'Operativo',
      soporte: 'Soporte',
    };
    return map[type] || type;
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      activo: 'Activo',
      inactivo: 'Inactivo',
      borrador: 'Borrador',
      en_revision: 'En Revisión',
    };
    return map[status] || status;
  }

  getRiskLabel(risk: string): string {
    const map: Record<string, string> = {
      bajo: 'Bajo',
      medio: 'Medio',
      alto: 'Alto',
      critico: 'Crítico',
    };
    return map[risk] || risk;
  }
}
