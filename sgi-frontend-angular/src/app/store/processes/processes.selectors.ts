import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProcessesState } from './processes.reducer';

export const selectProcessesState =
  createFeatureSelector<ProcessesState>('processes');

export const selectProcesses = createSelector(
  selectProcessesState,
  (state) => state.processes
);

export const selectProcessTree = createSelector(
  selectProcessesState,
  (state) => state.tree
);

export const selectSelectedProcess = createSelector(
  selectProcessesState,
  (state) => state.selected
);

export const selectProcessesTotal = createSelector(
  selectProcessesState,
  (state) => state.total
);

export const selectProcessesLoading = createSelector(
  selectProcessesState,
  (state) => state.loading
);
