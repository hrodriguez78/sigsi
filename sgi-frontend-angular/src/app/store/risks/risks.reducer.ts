import { createReducer, on } from '@ngrx/store';
import { Risk } from '../../core/models';
import * as Actions from './risks.actions';

export interface RisksState {
  risks: Risk[];
  matrix: any;
  stats: any;
  total: number;
  page: number;
  pageSize: number;
  search: string;
  loading: boolean;
  error: string | null;
}

export const initialState: RisksState = { risks: [], matrix: null, stats: null, total: 0, page: 1, pageSize: 20, search: '', loading: false, error: null };

export const risksReducer = createReducer(
  initialState,
  on(Actions.loadRisks, (s, { page, pageSize, search }) => ({ ...s, page: page ?? s.page, pageSize: pageSize ?? s.pageSize, search: search ?? s.search, loading: true, error: null })),
  on(Actions.loadRisksSuccess, (s, { risks, total }) => ({ ...s, risks, total, loading: false })),
  on(Actions.loadRisksFailure, (s, { error }) => ({ ...s, loading: false, error })),
  on(Actions.loadRiskMatrixSuccess, (s, { matrix }) => ({ ...s, matrix })),
  on(Actions.loadRiskStatsSuccess, (s, { stats }) => ({ ...s, stats })),
  on(Actions.createRiskSuccess, (s, { risk }) => ({ ...s, risks: [risk, ...s.risks], total: s.total + 1 })),
  on(Actions.updateRiskSuccess, (s, { risk }) => ({ ...s, risks: s.risks.map(r => r.id === risk.id ? risk : r) })),
  on(Actions.deleteRiskSuccess, (s, { id }) => ({ ...s, risks: s.risks.filter(r => r.id !== id), total: s.total - 1 })),
);
