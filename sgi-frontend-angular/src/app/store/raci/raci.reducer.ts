import { createReducer, on } from '@ngrx/store';
import { RaciMatrix } from '../../core/models';
import * as RaciActions from './raci.actions';

export interface RaciState {
  matrices: RaciMatrix[];
  selected: RaciMatrix | null;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export const initialState: RaciState = {
  matrices: [],
  selected: null,
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
};

export const raciReducer = createReducer(
  initialState,

  on(RaciActions.loadRaciMatrices, (state, { page, pageSize }) => ({
    ...state,
    page: page ?? state.page,
    pageSize: pageSize ?? state.pageSize,
    loading: true,
    error: null,
  })),

  on(RaciActions.loadRaciMatricesSuccess, (state, { matrices, total }) => ({
    ...state,
    matrices,
    total,
    loading: false,
  })),

  on(RaciActions.loadRaciMatricesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(RaciActions.loadRaciMatrixByIdSuccess, (state, { matrix }) => ({
    ...state,
    selected: matrix,
    loading: false,
  })),

  on(RaciActions.createRaciMatrixSuccess, (state, { matrix }) => ({
    ...state,
    matrices: [matrix, ...state.matrices],
    total: state.total + 1,
  })),

  on(RaciActions.updateRaciMatrixSuccess, (state, { matrix }) => ({
    ...state,
    matrices: state.matrices.map((m) => (m.id === matrix.id ? matrix : m)),
    selected: state.selected?.id === matrix.id ? matrix : state.selected,
  })),

  on(RaciActions.deleteRaciMatrixSuccess, (state, { id }) => ({
    ...state,
    matrices: state.matrices.filter((m) => m.id !== id),
    total: state.total - 1,
    selected: state.selected?.id === id ? null : state.selected,
  })),
);
