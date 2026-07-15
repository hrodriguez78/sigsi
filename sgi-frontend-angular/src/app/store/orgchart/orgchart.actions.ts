import { createAction, props } from '@ngrx/store';
import { OrgPosition, OrgTreeNode } from '../../core/models';

export const loadOrgChart = createAction(
  '[OrgChart] Load',
  props<{ organizationId: string }>()
);
export const loadOrgChartSuccess = createAction(
  '[OrgChart] Load Success',
  props<{ tree: OrgTreeNode | null; positions: OrgPosition[] }>()
);
export const loadOrgChartFailure = createAction(
  '[OrgChart] Load Failure',
  props<{ error: string }>()
);

export const createPosition = createAction(
  '[OrgChart] Create Position',
  props<{ organizationId: string; data: Partial<OrgPosition> }>()
);
export const createPositionSuccess = createAction(
  '[OrgChart] Create Position Success',
  props<{ position: OrgPosition }>()
);

export const updatePosition = createAction(
  '[OrgChart] Update Position',
  props<{ id: string; data: Partial<OrgPosition> }>()
);
export const updatePositionSuccess = createAction(
  '[OrgChart] Update Position Success',
  props<{ position: OrgPosition }>()
);

export const deletePosition = createAction(
  '[OrgChart] Delete Position',
  props<{ id: string }>()
);
export const deletePositionSuccess = createAction(
  '[OrgChart] Delete Position Success',
  props<{ id: string }>()
);

export const setSelectedPosition = createAction(
  '[OrgChart] Set Selected',
  props<{ positionId: string | null }>()
);
