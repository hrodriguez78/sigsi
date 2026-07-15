import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { AppState } from '../../../store/app.reducer';
import * as RaciActions from '../../../store/raci/raci.actions';
import { selectRaciSelected } from '../../../store/raci/raci.selectors';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-raci-form',
  templateUrl: './raci-form.component.html',
  styleUrls: ['./raci-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RaciFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  matrixId: string | null = null;
  roleInput = '';
  processInput = '';
  roles: string[] = [];
  processes: string[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private store: Store<AppState>,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
    });

    this.matrixId = this.route.snapshot.paramMap.get('id');
    if (this.matrixId) {
      this.isEdit = true;
      this.store.dispatch(RaciActions.loadRaciMatrixById({ id: this.matrixId }));

      this.store.select(selectRaciSelected).pipe(takeUntil(this.destroy$)).subscribe(m => {
        if (m && this.isEdit) {
          this.form.patchValue({ name: m.name, description: m.description });
          this.roles = [...m.role_names];
          this.processes = [...m.process_ids];
          this.cdr.markForCheck();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addRole(): void {
    const val = this.roleInput.trim();
    if (val && !this.roles.includes(val)) {
      this.roles.push(val);
      this.roleInput = '';
      this.cdr.markForCheck();
    }
  }

  removeRole(index: number): void {
    this.roles.splice(index, 1);
    this.cdr.markForCheck();
  }

  addProcess(): void {
    const val = this.processInput.trim();
    if (val && !this.processes.includes(val)) {
      this.processes.push(val);
      this.processInput = '';
      this.cdr.markForCheck();
    }
  }

  removeProcess(index: number): void {
    this.processes.splice(index, 1);
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.form.invalid || this.roles.length === 0) return;

    const orgId = this.authService.currentUser?.organization_id || '';

    const data = {
      organization_id: orgId,
      name: this.form.value.name,
      description: this.form.value.description,
      role_names: this.roles,
      process_ids: this.processes,
    };

    if (this.isEdit && this.matrixId) {
      this.store.dispatch(RaciActions.updateRaciMatrix({ id: this.matrixId, data }));
    } else {
      this.store.dispatch(RaciActions.createRaciMatrix({ data }));
    }

    this.router.navigate(['/raci']);
  }
}
