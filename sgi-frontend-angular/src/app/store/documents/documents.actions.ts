import { createAction, props } from '@ngrx/store';
import { Document, DocumentDetail } from '../../core/models';

export const loadDocuments = createAction(
  '[Documents] Load',
  props<{
    organizationId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    documentType?: string;
    status?: string;
  }>()
);

export const loadDocumentsSuccess = createAction(
  '[Documents] Load Success',
  props<{ documents: Document[]; total: number }>()
);

export const loadDocumentsFailure = createAction(
  '[Documents] Load Failure',
  props<{ error: string }>()
);

export const loadDocument = createAction(
  '[Documents] Load One',
  props<{ id: string }>()
);

export const loadDocumentSuccess = createAction(
  '[Documents] Load One Success',
  props<{ document: DocumentDetail }>()
);

export const createDocument = createAction(
  '[Documents] Create',
  props<{ data: Partial<Document> }>()
);

export const createDocumentSuccess = createAction(
  '[Documents] Create Success',
  props<{ document: Document }>()
);

export const createDocumentFailure = createAction(
  '[Documents] Create Failure',
  props<{ error: string }>()
);

export const updateDocument = createAction(
  '[Documents] Update',
  props<{ id: string; data: Partial<Document> }>()
);

export const updateDocumentSuccess = createAction(
  '[Documents] Update Success',
  props<{ document: Document }>()
);

export const updateDocumentFailure = createAction(
  '[Documents] Update Failure',
  props<{ error: string }>()
);

export const deleteDocument = createAction(
  '[Documents] Delete',
  props<{ id: string }>()
);

export const deleteDocumentSuccess = createAction(
  '[Documents] Delete Success',
  props<{ id: string }>()
);

export const deleteDocumentFailure = createAction(
  '[Documents] Delete Failure',
  props<{ error: string }>()
);

export const addDocumentVersion = createAction(
  '[Documents] Add Version',
  props<{ id: string; content: string; changeNotes: string }>()
);

export const publishDocument = createAction(
  '[Documents] Publish',
  props<{ id: string }>()
);

export const archiveDocument = createAction(
  '[Documents] Archive',
  props<{ id: string }>()
);
