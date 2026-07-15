import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, switchMap, map, filter } from 'rxjs/operators';

import { Control } from '../../../core/models';
import { AppState } from '../../../store/app.reducer';
import { selectControls } from '../../../store/controls/controls.selectors';
import * as ControlActions from '../../../store/controls/controls.actions';

@Component({
  selector: 'app-control-form',
  templateUrl: './control-form.component.html',
  styleUrls: ['./control-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isEditMode = false;
  controlId = '';
  loading$: Observable<boolean> = of(false);

  categoryOptions = [
    { value: 'organizativo', label: 'Organizativo' },
    { value: 'personas', label: 'Personas' },
    { value: 'fisico', label: 'Físico' },
    { value: 'tecnologico', label: 'Tecnológico' },
  ];

  implementationOptions = [
    { value: 'no_iniciado', label: 'No Iniciado' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'implementado', label: 'Implementado' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'no_aplicable', label: 'No Aplicable' },
  ];

  complianceOptions = [
    { value: 'total', label: 'Total' },
    { value: 'parcial', label: 'Parcial' },
    { value: 'minimo', label: 'Mínimo' },
    { value: 'ninguno', label: 'Ninguno' },
    { value: 'no_evaluado', label: 'No Evaluado' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private store: Store<AppState>
  ) {
    this.form = this.fb.group({
      control_id: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      category: ['organizativo', Validators.required],
      annex_a: [''],
      iso_clause: [''],
      implementation_status: ['no_iniciado', Validators.required],
      compliance_level: ['no_evaluado', Validators.required],
      evidence_description: [''],
      notes: [''],
    });
  }

  ngOnInit(): void {
    this.controlId = this.route.snapshot.paramMap.get('id') || '';
    if (this.controlId) {
      this.isEditMode = true;
      this.store.select(selectControls).pipe(
        takeUntil(this.destroy$),
        map(controls => controls.find(c => c.id === this.controlId)),
        filter((c): c is Control => !!c)
      ).subscribe(control => {
        this.form.patchValue({
          control_id: control.control_id,
          name: control.name,
          description: control.description,
          category: control.category,
          annex_a: control.annex_a || '',
          iso_clause: control.iso_clause || '',
          implementation_status: control.implementation_status,
          compliance_level: control.compliance_level,
          evidence_description: control.evidence_description,
          notes: control.notes,
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = { ...this.form.value, organization_id: '' };

    if (this.isEditMode) {
      this.store.dispatch(ControlActions.updateControl({ id: this.controlId, data }));
    } else {
      this.store.dispatch(ControlActions.createControl({ data }));
    }

    this.router.navigate(['/controls']);
  }
}
