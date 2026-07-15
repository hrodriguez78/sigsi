import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { AppState, selectUser } from '../../../store';
import * as AssetActions from '../../../store/assets/assets.actions';
import { selectSelectedAsset, selectAssetsLoading } from '../../../store/assets/assets.selectors';

@Component({
  selector: 'app-asset-form',
  templateUrl: './asset-form.component.html',
  styleUrls: ['./asset-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  loading = false;
  submitting = false;
  assetId: string | null = null;
  pageTitle = 'Nuevo Activo';

  private destroy$ = new Subject<void>();
  private organizationId = '';

  assetTypes = [
    { value: 'hardware', label: 'Hardware' },
    { value: 'software', label: 'Software' },
    { value: 'informacion', label: 'Información' },
    { value: 'servicio', label: 'Servicio' },
    { value: 'red', label: 'Red' },
    { value: 'personal', label: 'Personal' },
    { value: 'instalacion', label: 'Instalación' },
  ];

  criticalityOptions = [
    { value: 'bajo', label: 'Bajo' },
    { value: 'medio', label: 'Medio' },
    { value: 'alto', label: 'Alto' },
    { value: 'critico', label: 'Crítico' },
  ];

  statusOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'baja', label: 'Baja' },
  ];

  ciaLevels = [
    { value: 1, label: '1 - Muy Bajo' },
    { value: 2, label: '2 - Bajo' },
    { value: 3, label: '3 - Medio' },
    { value: 4, label: '4 - Alto' },
    { value: 5, label: '5 - Muy Alto' },
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.assetId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.assetId;
    this.pageTitle = this.isEditMode ? 'Editar Activo' : 'Nuevo Activo';

    this.store
      .select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user?.organization_id) {
          this.organizationId = user.organization_id;
        }
      });

    this.store
      .select(selectAssetsLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.loading = loading;
        this.cdr.markForCheck();
      });

    if (this.isEditMode && this.assetId) {
      this.store.dispatch(AssetActions.setSelectedAsset({ id: this.assetId }));

      this.store
        .select(selectSelectedAsset)
        .pipe(takeUntil(this.destroy$))
        .subscribe((asset) => {
          if (asset) {
            this.populateForm(asset);
            this.cdr.markForCheck();
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(500)]],
      asset_type: ['informacion', Validators.required],
      criticality: ['medio', Validators.required],
      status: ['activo', Validators.required],
      confidentiality: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      integrity: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      availability: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      process_id: [''],
      location: ['', [Validators.maxLength(200)]],
      brand: ['', [Validators.maxLength(100)]],
      model: ['', [Validators.maxLength(100)]],
      serial_number: ['', [Validators.maxLength(100)]],
      ip_address: ['', [Validators.maxLength(45)]],
      operating_system: ['', [Validators.maxLength(100)]],
    });
  }

  private populateForm(asset: any): void {
    this.form.patchValue({
      name: asset.name,
      code: asset.code,
      description: asset.description,
      asset_type: asset.asset_type,
      criticality: asset.criticality,
      status: asset.status,
      confidentiality: asset.cia?.confidentiality ?? 3,
      integrity: asset.cia?.integrity ?? 3,
      availability: asset.cia?.availability ?? 3,
      process_id: asset.process_id || '',
      location: asset.location,
      brand: asset.brand,
      model: asset.model,
      serial_number: asset.serial_number,
      ip_address: asset.ip_address,
      operating_system: asset.operating_system,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.form.value;

    const payload: any = {
      organization_id: this.organizationId,
      name: formValue.name,
      code: formValue.code,
      description: formValue.description,
      asset_type: formValue.asset_type,
      criticality: formValue.criticality,
      status: formValue.status,
      cia: {
        confidentiality: Number(formValue.confidentiality),
        integrity: Number(formValue.integrity),
        availability: Number(formValue.availability),
      },
      process_id: formValue.process_id || null,
      location: formValue.location,
      brand: formValue.brand,
      model: formValue.model,
      serial_number: formValue.serial_number,
      ip_address: formValue.ip_address,
      operating_system: formValue.operating_system,
    };

    if (this.isEditMode && this.assetId) {
      this.store.dispatch(AssetActions.updateAsset({ id: this.assetId, data: payload }));
    } else {
      this.store.dispatch(AssetActions.createAsset({ data: payload }));
    }

    setTimeout(() => {
      this.submitting = false;
      this.router.navigate(['/assets']);
    }, 500);
  }

  cancel(): void {
    this.router.navigate(['/assets']);
  }

  get f() {
    return this.form.controls;
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    if (control.errors['min']) return `El valor mínimo es ${control.errors['min'].min}`;
    if (control.errors['max']) return `El valor máximo es ${control.errors['max'].max}`;

    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
