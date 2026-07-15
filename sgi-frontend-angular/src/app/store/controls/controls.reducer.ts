import { createReducer, on } from '@ngrx/store';
import { Control } from '../../core/models';
import * as A from './controls.actions';
export interface ControlsState { controls: Control[]; stats: any; soa: any; total: number; page: number; pageSize: number; loading: boolean; error: string | null; }
export const initialState: ControlsState = { controls: [], stats: null, soa: null, total: 0, page: 1, pageSize: 20, loading: false, error: null };
export const controlsReducer = createReducer(initialState,
  on(A.loadControls, s => ({ ...s, loading: true })),
  on(A.loadControlsSuccess, (s, { controls, total }) => ({ ...s, controls, total, loading: false })),
  on(A.loadControlsFailure, (s, { error }) => ({ ...s, loading: false, error })),
  on(A.loadControlStatsSuccess, (s, { stats }) => ({ ...s, stats })),
  on(A.loadSoASuccess, (s, { soa }) => ({ ...s, soa })),
  on(A.createControlSuccess, (s, { control }) => ({ ...s, controls: [control, ...s.controls], total: s.total + 1 })),
  on(A.updateControlSuccess, (s, { control }) => ({ ...s, controls: s.controls.map(c => c.id === control.id ? control : c) })),
  on(A.deleteControlSuccess, (s, { id }) => ({ ...s, controls: s.controls.filter(c => c.id !== id), total: s.total - 1 })),
);
