import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { RaciMatrix } from '../../../core/models';
import { AppState } from '../../../store/app.reducer';
import { ExportService } from '../../../core/services/export.service';
import * as RaciActions from '../../../store/raci/raci.actions';
import { selectRaciMatrices, selectRaciTotal, selectRaciLoading } from '../../../store/raci/raci.selectors';

@Component({
  selector: 'app-raci-list',
  templateUrl: './raci-list.component.html',
  styleUrls: ['./raci-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RaciListComponent implements OnInit, OnDestroy {
  matrices: RaciMatrix[] = [];
  total = 0;
  loading = false;
  currentPage = 1;
  pageSize = 20;
  searchText = '';
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private exportService: ExportService,
  ) {}

  ngOnInit(): void {
    this.loadData();

    this.store.select(selectRaciMatrices).pipe(takeUntil(this.destroy$)).subscribe(m => {
      this.matrices = m;
      this.cdr.markForCheck();
    });

    this.store.select(selectRaciTotal).pipe(takeUntil(this.destroy$)).subscribe(t => {
      this.total = t;
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

  loadData(): void {
    const orgId = this.getOrgId();
    if (orgId) {
      this.store.dispatch(RaciActions.loadRaciMatrices({
        organizationId: orgId,
        page: this.currentPage,
        pageSize: this.pageSize,
        search: this.searchText,
      }));
    }
  }

  viewMatrix(id: string): void {
    this.router.navigate(['/raci', id]);
  }

  editMatrix(id: string): void {
    this.router.navigate(['/raci', id, 'edit']);
  }

  createMatrix(): void {
    this.router.navigate(['/raci/new']);
  }

  deleteMatrix(id: string): void {
    if (confirm('¿Está seguro de eliminar esta matriz RACI?')) {
      this.store.dispatch(RaciActions.deleteRaciMatrix({ id }));
    }
  }

  exportData(): void {
    this.exportService.exportModule('raci');
  }

  onSearch(term: string): void {
    this.searchText = term;
    this.currentPage = 1;
    this.loadData();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadData();
  }

  private getOrgId(): string {
    return localStorage.getItem('organization_id') || '';
  }
}
