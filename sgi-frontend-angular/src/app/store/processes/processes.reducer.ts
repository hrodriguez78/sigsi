import { createReducer, on } from '@ngrx/store';
import { Process } from '../../core/models';
import * as ProcActions from './processes.actions';

export interface ProcessesState {
  processes: Process[];
  tree: Process[];
  selected: Process | null;
  total: number;
  page: number;
  pageSize: number;
  search: string;
  loading: boolean;
  error: string | null;
}

export const initialState: ProcessesState = {
  processes: [],
  tree: [],
  selected: null,
  total: 0,
  page: 1,
  pageSize: 20,
  search: '',
  loading: false,
  error: null,
};

export const processesReducer = createReducer(
  initialState,

  on(ProcActions.loadProcesses, (state, { page, pageSize, search }) => ({
    ...state,
    page: page ?? state.page,
    pageSize: pageSize ?? state.pageSize,
    search: search ?? state.search,
    loading: true,
    error: null,
  })),

  on(ProcActions.loadProcessesSuccess, (state, { processes, total }) => ({
    ...state,
    processes,
    total,
    loading: false,
  })),

  on(ProcActions.loadProcessesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ProcActions.loadProcessTreeSuccess, (state, { tree }) => ({
    ...state,
    tree,
    loading: false,
  })),

  on(ProcActions.createProcessSuccess, (state, { process }) => ({
    ...state,
    processes: [process, ...state.processes],
    total: state.total + 1,
  })),

  on(ProcActions.updateProcessSuccess, (state, { process }) => ({
    ...state,
    processes: state.processes.map((p) =>
      p.id === process.id ? process : p
    ),
    selected: state.selected?.id === process.id ? process : state.selected,
  })),

  on(ProcActions.deleteProcessSuccess, (state, { id }) => ({
    ...state,
    processes: state.processes.filter((p) => p.id !== id),
    total: state.total - 1,
    selected: state.selected?.id === id ? null : state.selected,
  })),

  on(ProcActions.setSelectedProcess, (state, { id }) => ({
    ...state,
    selected: id ? state.processes.find((p) => p.id === id) || null : null,
  }))
);
