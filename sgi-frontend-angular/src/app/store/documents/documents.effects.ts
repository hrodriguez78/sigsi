import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Document } from '../../core/models';
import * as DocActions from './documents.actions';

@Injectable()
export class DocumentsEffects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocActions.loadDocuments),
      mergeMap(({ organizationId, page, pageSize, search, documentType, status }) => {
        const params = new URLSearchParams();
        params.set('organization_id', organizationId);
        params.set('page', String(page || 1));
        params.set('page_size', String(pageSize || 20));
        if (search) params.set('search', search);
        if (documentType) params.set('document_type', documentType);
        if (status) params.set('status', status);
        return this.api.get<any>(`/documents?${params.toString()}`).pipe(
          map((res) =>
            DocActions.loadDocumentsSuccess({ documents: res.documents, total: res.total })
          ),
          catchError((err) =>
            of(DocActions.loadDocumentsFailure({ error: err.error?.detail || 'Error' }))
          )
        );
      })
    )
  );

  loadOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocActions.loadDocument),
      mergeMap(({ id }) =>
        this.api.get<any>(`/documents/${id}`).pipe(
          map((doc) => DocActions.loadDocumentSuccess({ document: doc })),
          catchError((err) =>
            of(DocActions.loadDocumentsFailure({ error: err.error?.detail || 'Error' }))
          )
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocActions.createDocument),
      mergeMap(({ data }) =>
        this.api.post<Document>('/documents', data).pipe(
          map((doc) => {
            this.toast.success('Documento creado');
            return DocActions.createDocumentSuccess({ document: doc });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al crear');
            return of(DocActions.createDocumentFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocActions.updateDocument),
      mergeMap(({ id, data }) =>
        this.api.put<Document>(`/documents/${id}`, data).pipe(
          map((doc) => {
            this.toast.success('Documento actualizado');
            return DocActions.updateDocumentSuccess({ document: doc });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al actualizar');
            return of(DocActions.updateDocumentFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocActions.deleteDocument),
      mergeMap(({ id }) =>
        this.api.delete(`/documents/${id}`).pipe(
          map(() => {
            this.toast.success('Documento eliminado');
            return DocActions.deleteDocumentSuccess({ id });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al eliminar');
            return of(DocActions.deleteDocumentFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  publish$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocActions.publishDocument),
      mergeMap(({ id }) =>
        this.api.post<Document>(`/documents/${id}/publish`, {}).pipe(
          map((doc) => {
            this.toast.success('Documento publicado');
            return DocActions.updateDocumentSuccess({ document: doc });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al publicar');
            return of({ type: 'NOOP' });
          })
        )
      )
    )
  );

  archive$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DocActions.archiveDocument),
      mergeMap(({ id }) =>
        this.api.post<Document>(`/documents/${id}/archive`, {}).pipe(
          map((doc) => {
            this.toast.success('Documento archivado');
            return DocActions.updateDocumentSuccess({ document: doc });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al archivar');
            return of({ type: 'NOOP' });
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private toast: ToastService
  ) {}
}
