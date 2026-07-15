import { createReducer, on } from '@ngrx/store';
import * as CandActions from './candidates.actions';
import { Candidate, CandidateDocument, CandidateTest, CandidateActivity, PipelineStats } from './candidates.actions';

export interface CandidatesState {
  candidates: Candidate[];
  selected: Candidate | null;
  total: number;
  page: number;
  pageSize: number;
  search: string;
  loading: boolean;
  error: string | null;
  pipelineStats: PipelineStats | null;
  documents: CandidateDocument[];
  tests: CandidateTest[];
  activities: CandidateActivity[];
}

export const initialState: CandidatesState = {
  candidates: [],
  selected: null,
  total: 0,
  page: 1,
  pageSize: 20,
  search: '',
  loading: false,
  error: null,
  pipelineStats: null,
  documents: [],
  tests: [],
  activities: [],
};

export const candidatesReducer = createReducer(
  initialState,

  on(CandActions.loadCandidates, (state, { page, pageSize, search }) => ({
    ...state,
    page: page ?? state.page,
    pageSize: pageSize ?? state.pageSize,
    search: search ?? state.search,
    loading: true,
    error: null,
  })),

  on(CandActions.loadCandidatesSuccess, (state, { candidates, total }) => ({
    ...state,
    candidates,
    total,
    loading: false,
  })),

  on(CandActions.loadCandidatesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(CandActions.loadPipelineStatsSuccess, (state, { stats }) => ({
    ...state,
    pipelineStats: stats,
  })),

  on(CandActions.loadCandidateSuccess, (state, { candidate }) => ({
    ...state,
    selected: candidate,
  })),

  on(CandActions.createCandidateSuccess, (state, { candidate }) => ({
    ...state,
    candidates: [candidate, ...state.candidates],
    total: state.total + 1,
  })),

  on(CandActions.updateCandidateSuccess, (state, { candidate }) => ({
    ...state,
    candidates: state.candidates.map(c => c.id === candidate.id ? candidate : c),
    selected: state.selected?.id === candidate.id ? candidate : state.selected,
  })),

  on(CandActions.deleteCandidateSuccess, (state, { id }) => ({
    ...state,
    candidates: state.candidates.filter(c => c.id !== id),
    total: state.total - 1,
    selected: state.selected?.id === id ? null : state.selected,
  })),

  on(CandActions.loadDocumentsSuccess, (state, { documents }) => ({
    ...state,
    documents,
  })),

  on(CandActions.addDocumentSuccess, (state, { document: doc }) => ({
    ...state,
    documents: [doc, ...state.documents],
  })),

  on(CandActions.verifyDocumentSuccess, (state, { document: doc }) => ({
    ...state,
    documents: state.documents.map(d => d.id === doc.id ? doc : d),
  })),

  on(CandActions.loadTestsSuccess, (state, { tests }) => ({
    ...state,
    tests,
  })),

  on(CandActions.addTestSuccess, (state, { test }) => ({
    ...state,
    tests: [test, ...state.tests],
  })),

  on(CandActions.updateTestSuccess, (state, { test }) => ({
    ...state,
    tests: state.tests.map(t => t.id === test.id ? test : t),
  })),

  on(CandActions.loadActivitiesSuccess, (state, { activities }) => ({
    ...state,
    activities,
  })),

  on(CandActions.addActivitySuccess, (state, { activity }) => ({
    ...state,
    activities: [activity, ...state.activities],
  })),
);
