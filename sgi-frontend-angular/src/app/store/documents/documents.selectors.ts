import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DocumentsState } from './documents.reducer';

export const selectDocumentsState =
  createFeatureSelector<DocumentsState>('documents');

export const selectDocuments = createSelector(selectDocumentsState, (s) => s.documents);
export const selectSelectedDocument = createSelector(selectDocumentsState, (s) => s.selected);
export const selectDocumentsTotal = createSelector(selectDocumentsState, (s) => s.total);
export const selectDocumentsLoading = createSelector(selectDocumentsState, (s) => s.loading);
