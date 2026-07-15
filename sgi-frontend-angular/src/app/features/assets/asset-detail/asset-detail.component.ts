import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { AppState } from '../../../store';
import * as AssetActions from '../../../store/assets/assets.actions';
import { selectSelectedAsset, selectAssetsLoading } from '../../../store/assets/assets.selectors';
import { Asset } from '../../../core/models';

@Component({
  selector: 'app-asset-detail',
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetDetailComponent implements OnInit, OnDestroy {
  asset: Asset | null = null;
  loading = false;
  showDeleteDialog = false;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.dispatch(AssetActions.setSelectedAsset({ id }));
    }

    this.store
      .select(selectSelectedAsset)
      .pipe(takeUntil(this.destroy$))
      .subscribe((asset) => {
        this.asset = asset;
        this.cdr.markForCheck();
      });

    this.store
      .select(selectAssetsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.loading = loading;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/assets']);
  }

  editAsset(): void {
    if (this.asset) {
      this.router.navigate(['/assets', this.asset.id, 'edit']);
    }
  }

  confirmDelete(): void {
    this.showDeleteDialog = true;
  }

  onDeleteConfirmed(): void {
    if (this.asset) {
      this.store.dispatch(AssetActions.deleteAsset({ id: this.asset.id }));
      this.router.navigate(['/assets']);
    }
    this.showDeleteDialog = false;
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog = false;
  }

  getCiaPercent(value: number): number {
    return (value / 5) * 100;
  }

  getCiaBarClass(value: number): string {
    if (value <= 2) return 'cia-bar--low';
    if (value <= 4) return 'cia-bar--medium';
    return 'cia-bar--high';
  }

  getCriticalityLabel(criticality: string): string {
    const labels: Record<string, string> = {
      bajo: 'Bajo',
      medio: 'Medio',
      alto: 'Alto',
      critico: 'Crítico',
    };
    return labels[criticality] || criticality;
  }

  getRiskLevelFromCriticality(criticality: string): { label: string; class: string; description: string } {
    const levels: Record<string, { label: string; class: string; description: string }> = {
      bajo: {
        label: 'Riesgo Bajo',
        class: 'risk--bajo',
        description: 'Impacto mínimo sobre la confidencialidad, integridad o disponibilidad.',
      },
      medio: {
        label: 'Riesgo Medio',
        class: 'risk--medio',
        description: 'Impacto moderado que puede afectar parcialmente las operaciones.',
      },
      alto: {
        label: 'Riesgo Alto',
        class: 'risk--alto',
        description: 'Impacto significativo que puede comprometer procesos críticos.',
      },
      critico: {
        label: 'Riesgo Crítico',
        class: 'risk--critico',
        description: 'Impacto severo que puede comprometer la continuidad del negocio.',
      },
    };
    return levels[criticality] || { label: criticality, class: '', description: '' };
  }

  getRiskScore(): number {
    if (!this.asset) return 0;
    return this.asset.cia.confidentiality + this.asset.cia.integrity + this.asset.cia.availability;
  }

  getAssetTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      hardware: 'Hardware',
      software: 'Software',
      informacion: 'Información',
      servicio: 'Servicio',
      red: 'Red',
      personal: 'Personal',
      instalacion: 'Instalación',
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      activo: 'Activo',
      inactivo: 'Inactivo',
      baja: 'Baja',
    };
    return labels[status] || status;
  }
}
