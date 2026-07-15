import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IncidentsState } from './incidents.reducer';
export const selectIncidentsState = createFeatureSelector<IncidentsState>('incidents');
export const selectIncidents = createSelector(selectIncidentsState, s => s.incidents);
export const selectIncidentStats = createSelector(selectIncidentsState, s => s.stats);
export const selectIncidentsTotal = createSelector(selectIncidentsState, s => s.total);
export const selectIncidentsLoading = createSelector(selectIncidentsState, s => s.loading);
export const selectIncidentById = (id: string) => createSelector(selectIncidents, incidents => incidents.find(i => i.id === id));
