import { createReducer, on } from '@ngrx/store';
import { OrgPosition, OrgTreeNode } from '../../core/models';
import * as OrgChartActions from './orgchart.actions';

export interface OrgChartState {
  tree: OrgTreeNode | null;
  positions: OrgPosition[];
  selectedPositionId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialState: OrgChartState = {
  tree: null,
  positions: [],
  selectedPositionId: null,
  loading: false,
  error: null,
};

export const orgchartReducer = createReducer(
  initialState,
  on(OrgChartActions.loadOrgChart, (state) => ({ ...state, loading: true, error: null })),
  on(OrgChartActions.loadOrgChartSuccess, (state, { tree, positions }) => ({
    ...state,
    tree,
    positions,
    loading: false,
  })),
  on(OrgChartActions.loadOrgChartFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(OrgChartActions.createPositionSuccess, (state, { position }) => ({
    ...state,
    positions: [...state.positions, position],
  })),
  on(OrgChartActions.updatePositionSuccess, (state, { position }) => ({
    ...state,
    positions: state.positions.map((p) => (p.id === position.id ? position : p)),
  })),
  on(OrgChartActions.deletePositionSuccess, (state, { id }) => ({
    ...state,
    positions: state.positions.filter((p) => p.id !== id),
    selectedPositionId: state.selectedPositionId === id ? null : state.selectedPositionId,
  })),
  on(OrgChartActions.setSelectedPosition, (state, { positionId }) => ({
    ...state,
    selectedPositionId: positionId,
  }))
);
