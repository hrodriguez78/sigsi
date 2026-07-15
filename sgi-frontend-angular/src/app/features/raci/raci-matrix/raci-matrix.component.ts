import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { RaciMatrix } from '../../../core/models';
import { AppState } from '../../../store/app.reducer';
import * as RaciActions from '../../../store/raci/raci.actions';
import { selectRaciSelected, selectRaciLoading } from '../../../store/raci/raci.selectors';

@Component({
  selector: 'app-raci-matrix',
  templateUrl: './raci-matrix.component.html',
  styleUrls: ['./raci-matrix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RaciMatrixComponent implements OnInit, OnDestroy {
  matrix: RaciMatrix | null = null;
  loading = false;
  showEditDialog = false;
  newRole = '';
  private matrixId = '';
  private destroy$ = new Subject<void>();

  raciOptions = [
    { value: 'R', label: 'R - Responsable', color: '#1565C0' },
    { value: 'A', label: 'A - A cargo', color: '#2E7D32' },
    { value: 'C', label: 'C - Consultado', color: '#E65100' },
    { value: 'I', label: 'I - Informado', color: '#6A1B9A' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.matrixId = this.route.snapshot.paramMap.get('id') || '';
    if (this.matrixId) {
      this.store.dispatch(RaciActions.loadRaciMatrixById({ id: this.matrixId }));
    }

    this.store.select(selectRaciSelected).pipe(takeUntil(this.destroy$)).subscribe(m => {
      this.matrix = m;
      this.cdr.markForCheck();
    });

    this.store.select(selectRaciLoading).pipe(takeUntil(this.destroy$)).subscribe(l => {
      this.loading = l;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getRaciValue(processId: string, roleName: string): string {
    return this.matrix?.assignments?.[processId]?.[roleName] || '';
  }

  setRaciValue(processId: string, roleName: string, value: string): void {
    if (!this.matrix) return;
    const assignments = { ...this.matrix.assignments };
    assignments[processId] = { ...assignments[processId] };
    assignments[processId][roleName] = value;

    this.matrix = { ...this.matrix, assignments };
    this.cdr.markForCheck();

    this.store.dispatch(RaciActions.updateRaciMatrix({
      id: this.matrixId,
      data: { assignments },
    }));
  }

  addRole(): void {
    if (!this.newRole.trim() || !this.matrix) return;
    const roles = [...this.matrix.role_names, this.newRole.trim()];
    this.matrix = { ...this.matrix, role_names: roles };
    this.newRole = '';
    this.cdr.markForCheck();

    this.store.dispatch(RaciActions.updateRaciMatrix({
      id: this.matrixId,
      data: { role_names: roles },
    }));
  }

  removeRole(roleName: string): void {
    if (!this.matrix) return;
    const roles = this.matrix.role_names.filter(r => r !== roleName);
    const assignments = { ...this.matrix.assignments };
    for (const pid of Object.keys(assignments)) {
      const row = { ...assignments[pid] };
      delete row[roleName];
      assignments[pid] = row;
    }
    this.matrix = { ...this.matrix, role_names: roles, assignments };
    this.cdr.markForCheck();

    this.store.dispatch(RaciActions.updateRaciMatrix({
      id: this.matrixId,
      data: { role_names: roles, assignments },
    }));
  }

  getRaciColor(value: string): string {
    const opt = this.raciOptions.find(o => o.value === value);
    return opt?.color || 'transparent';
  }

  getRaciLabel(value: string): string {
    const opt = this.raciOptions.find(o => o.value === value);
    return opt?.label || value;
  }

  cycleRaci(processId: string, roleName: string): void {
    const current = this.getRaciValue(processId, roleName);
    const cycle = ['', 'R', 'A', 'C', 'I'];
    const idx = cycle.indexOf(current);
    const next = cycle[(idx + 1) % cycle.length];
    this.setRaciValue(processId, roleName, next);
  }

  goBack(): void {
    this.router.navigate(['/raci']);
  }

  editMatrix(): void {
    this.router.navigate(['/raci', this.matrixId, 'edit']);
  }

  deleteMatrix(): void {
    if (confirm('¿Está seguro de eliminar esta matriz RACI?')) {
      this.store.dispatch(RaciActions.deleteRaciMatrix({ id: this.matrixId }));
      this.router.navigate(['/raci']);
    }
  }

  onProcessDrop(event: CdkDragDrop<string[]>): void {
    if (!this.matrix) return;
    const processes = [...this.matrix.process_ids];
    moveItemInArray(processes, event.previousIndex, event.currentIndex);
    this.matrix = { ...this.matrix, process_ids: processes };
    this.cdr.markForCheck();

    this.store.dispatch(RaciActions.updateRaciMatrix({
      id: this.matrixId,
      data: { process_ids: processes },
    }));
  }

  onRoleDrop(event: CdkDragDrop<string[]>): void {
    if (!this.matrix) return;
    const roles = [...this.matrix.role_names];
    moveItemInArray(roles, event.previousIndex, event.currentIndex);
    this.matrix = { ...this.matrix, role_names: roles };
    this.cdr.markForCheck();

    this.store.dispatch(RaciActions.updateRaciMatrix({
      id: this.matrixId,
      data: { role_names: roles },
    }));
  }
}
