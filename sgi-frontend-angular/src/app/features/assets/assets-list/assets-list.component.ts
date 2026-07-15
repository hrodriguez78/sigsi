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

import { AppState, selectUser } from '../../../store';
import * as AssetActions from '../../../store/assets/assets.actions';
import {
  selectAssets,
  selectAssetsLoading,
  selectAssetsTotal,
} from '../../../store/assets/assets.selectors';
import { Asset } from '../../../core/models';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsListComponent implements OnInit, OnDestroy {
  assets: Asset[] = [];
  loading = false;
  total = 0;
  page = 1;
  pageSize = 20;

  search = '';
  filterType = '';
  filterCriticality = '';
  filterStatus = '';

  showDeleteDialog = false;
  assetToDelete: Asset | null = null;

  assetTypes = [
    { value: '', label: 'Todos los tipos' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'software', label: 'Software' },
    { value: 'informacion', label: 'Información' },
    { value: 'servicio', label: 'Servicio' },
    { value: 'red', label: 'Red' },
    { value: 'personal', label: 'Personal' },
    { value: 'instalacion', label: 'Instalación' },
  ];

  criticalityOptions = [
    { value: '', label: 'Todas' },
    { value: 'bajo', label: 'Bajo' },
    { value: 'medio', label: 'Medio' },
    { value: 'alto', label: 'Alto' },
    { value: 'critico', label: 'Crítico' },
  ];

  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'baja', label: 'Baja' },
  ];

  private destroy$ = new Subject<void>();
  private organizationId = '';

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private exportService: ExportService,
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user?.organization_id) {
          this.organizationId = user.organization_id;
          this.loadAssets();
        }
      });

    this.store
      .select(selectAssets)
      .pipe(takeUntil(this.destroy$))
      .subscribe((assets) => {
        this.assets = assets;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectAssetsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.loading = loading;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectAssetsTotal)
      .pipe(takeUntil(this.destroy$))
      .subscribe((total) => {
        this.total = total;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAssets(): void {
    this.store.dispatch(
      AssetActions.loadAssets({
        organizationId: this.organizationId,
        page: this.page,
        pageSize: this.pageSize,
        search: this.search || undefined,
        assetType: this.filterType || undefined,
        criticality: this.filterCriticality || undefined,
        status: this.filterStatus || undefined,
      })
    );
  }

  onSearch(): void {
    this.page = 1;
    this.loadAssets();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadAssets();
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadAssets();
  }

  viewAsset(asset: Asset): void {
    this.router.navigate(['/assets', asset.id]);
  }

  editAsset(asset: Asset): void {
    this.router.navigate(['/assets', asset.id, 'edit']);
  }

  confirmDelete(asset: Asset): void {
    this.assetToDelete = asset;
    this.showDeleteDialog = true;
  }

  onDeleteConfirmed(): void {
    if (this.assetToDelete) {
      this.store.dispatch(AssetActions.deleteAsset({ id: this.assetToDelete.id }));
    }
    this.showDeleteDialog = false;
    this.assetToDelete = null;
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog = false;
    this.assetToDelete = null;
  }

  exportData(): void {
    this.exportService.exportModule('assets');
  }

  navigateToNew(): void {
    this.router.navigate(['/assets/new']);
  }

  getCriticalityClass(criticality: string): string {
    return 'badge--' + criticality;
  }

  getTypeClass(type: string): string {
    return 'badge--type-' + type;
  }

  getCiaAverage(asset: Asset): number {
    const cia = asset.cia;
    return ((cia.confidentiality + cia.integrity + cia.availability) / 3);
  }
}
