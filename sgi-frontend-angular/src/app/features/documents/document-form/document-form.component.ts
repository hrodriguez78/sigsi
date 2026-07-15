import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { DocumentDetail } from '../../../core/models';
import { selectSelectedDocument } from '../../../store/documents/documents.selectors';
import { loadDocument, createDocument, updateDocument } from '../../../store/documents/documents.actions';

@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  documentId = '';
  submitting = false;
  title = 'Nuevo Documento';

  readonly documentTypes = [
    { value: 'politica', label: 'Política' },
    { value: 'procedimiento', label: 'Procedimiento' },
    { value: 'lineamiento', label: 'Lineamiento' },
    { value: 'manual', label: 'Manual' },
    { value: 'formato', label: 'Formato' },
    { value: 'registro', label: 'Registro' },
    { value: 'plan', label: 'Plan' },
    { value: 'reporte', label: 'Reporte' },
    { value: 'otro', label: 'Otro' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.documentId = this.route.snapshot.paramMap.get('id') || '';
    this.isEditMode = !!this.documentId;

    if (this.isEditMode) {
      this.title = 'Editar Documento';
      this.store.dispatch(loadDocument({ id: this.documentId }));

      this.store
        .select(selectSelectedDocument)
        .pipe(takeUntil(this.destroy$))
        .subscribe((doc) => {
          if (doc && doc.id === this.documentId) {
            this.populateForm(doc);
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
      title: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required]],
      description: ['', [Validators.required]],
      document_type: ['procedimiento', Validators.required],
      process_id: [''],
      content: [''],
      tags: [''],
    });
  }

  private populateForm(doc: DocumentDetail): void {
    this.form.patchValue({
      title: doc.title,
      code: doc.code,
      description: doc.description,
      document_type: doc.document_type,
      process_id: doc.process_id || '',
      content: doc.content || '',
      tags: doc.tags?.join(', ') || '',
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.form.value;

    const tags = formValue.tags
      ? formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
      : [];

    const data = {
      title: formValue.title,
      code: formValue.code,
      description: formValue.description,
      document_type: formValue.document_type,
      process_id: formValue.process_id || undefined,
      content: formValue.content,
      tags,
    };

    if (this.isEditMode) {
      this.store.dispatch(updateDocument({ id: this.documentId, data }));
    } else {
      this.store.dispatch(createDocument({ data }));
    }

    this.submitting = false;
    this.router.navigate(['/documents']);
  }

  cancel(): void {
    this.router.navigate(['/documents']);
  }

  get f() {
    return this.form.controls;
  }
}
