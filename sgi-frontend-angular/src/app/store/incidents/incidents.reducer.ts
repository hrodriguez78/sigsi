import { createReducer, on } from '@ngrx/store';
import { Incident } from '../../core/models';
import * as A from './incidents.actions';
export interface IncidentsState { incidents: Incident[]; stats: any; total: number; page: number; pageSize: number; loading: boolean; error: string | null; }
export const initialState: IncidentsState = { incidents: [], stats: null, total: 0, page: 1, pageSize: 20, loading: false, error: null };
export const incidentsReducer = createReducer(initialState,
  on(A.loadIncidents, s => ({ ...s, loading: true })),
  on(A.loadIncidentsSuccess, (s, { incidents, total }) => ({ ...s, incidents, total, loading: false })),
  on(A.loadIncidentsFailure, (s, { error }) => ({ ...s, loading: false, error })),
  on(A.loadIncidentStatsSuccess, (s, { stats }) => ({ ...s, stats })),
  on(A.createIncidentSuccess, (s, { incident }) => ({ ...s, incidents: [incident, ...s.incidents], total: s.total + 1 })),
  on(A.updateIncidentSuccess, (s, { incident }) => ({ ...s, incidents: s.incidents.map(i => i.id === incident.id ? incident : i) })),
  on(A.deleteIncidentSuccess, (s, { id }) => ({ ...s, incidents: s.incidents.filter(i => i.id !== id), total: s.total - 1 })),
);
