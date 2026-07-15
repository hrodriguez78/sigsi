import { createReducer, on } from '@ngrx/store';
import { Document, DocumentDetail } from '../../core/models';
import * as DocActions from './documents.actions';

export interface DocumentsState {
  documents: Document[];
  selected: DocumentDetail | null;
  total: number;
  page: number;
  pageSize: number;
  search: string;
  loading: boolean;
  error: string | null;
}

export const initialState: DocumentsState = {
  documents: [],
  selected: null,
  total: 0,
  page: 1,
  pageSize: 20,
  search: '',
  loading: false,
  error: null,
};

export const documentsReducer = createReducer(
  initialState,

  on(DocActions.loadDocuments, (state, { page, pageSize, search }) => ({
    ...state,
    page: page ?? state.page,
    pageSize: pageSize ?? state.pageSize,
    search: search ?? state.search,
    loading: true,
    error: null,
  })),

  on(DocActions.loadDocumentsSuccess, (state, { documents, total }) => ({
    ...state,
    documents,
    total,
    loading: false,
  })),

  on(DocActions.loadDocumentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(DocActions.loadDocumentSuccess, (state, { document }) => ({
    ...state,
    selected: document,
    loading: false,
  })),

  on(DocActions.createDocumentSuccess, (state, { document }) => ({
    ...state,
    documents: [document, ...state.documents],
    total: state.total + 1,
  })),

  on(DocActions.updateDocumentSuccess, (state, { document }) => ({
    ...state,
    documents: state.documents.map((d) =>
      d.id === document.id ? document : d
    ),
    selected:
      state.selected?.id === document.id
        ? { ...state.selected, ...document }
        : state.selected,
  })),

  on(DocActions.deleteDocumentSuccess, (state, { id }) => ({
    ...state,
    documents: state.documents.filter((d) => d.id !== id),
    total: state.total - 1,
    selected: state.selected?.id === id ? null : state.selected,
  }))
);
