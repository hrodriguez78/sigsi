import { createAction, props } from '@ngrx/store';
import { Organization } from '../../core/models';

export const loadOrganizations = createAction(
  '[Organizations] Load',
  props<{ page?: number; pageSize?: number; search?: string }>()
);

export const loadOrganizationsSuccess = createAction(
  '[Organizations] Load Success',
  props<{ organizations: Organization[]; total: number }>()
);

export const loadOrganizationsFailure = createAction(
  '[Organizations] Load Failure',
  props<{ error: string }>()
);

export const loadOrganization = createAction(
  '[Organizations] Load One',
  props<{ id: string }>()
);

export const loadOrganizationSuccess = createAction(
  '[Organizations] Load One Success',
  props<{ organization: Organization }>()
);

export const createOrganization = createAction(
  '[Organizations] Create',
  props<{ data: Partial<Organization> }>()
);

export const createOrganizationSuccess = createAction(
  '[Organizations] Create Success',
  props<{ organization: Organization }>()
);

export const createOrganizationFailure = createAction(
  '[Organizations] Create Failure',
  props<{ error: string }>()
);

export const updateOrganization = createAction(
  '[Organizations] Update',
  props<{ id: string; data: Partial<Organization> }>()
);

export const updateOrganizationSuccess = createAction(
  '[Organizations] Update Success',
  props<{ organization: Organization }>()
);

export const updateOrganizationFailure = createAction(
  '[Organizations] Update Failure',
  props<{ error: string }>()
);

export const deleteOrganization = createAction(
  '[Organizations] Delete',
  props<{ id: string }>()
);

export const deleteOrganizationSuccess = createAction(
  '[Organizations] Delete Success',
  props<{ id: string }>()
);

export const deleteOrganizationFailure = createAction(
  '[Organizations] Delete Failure',
  props<{ error: string }>()
);

export const setSelectedOrganization = createAction(
  '[Organizations] Set Selected',
  props<{ id: string | null }>()
);

export const clearOrganizationError = createAction(
  '[Organizations] Clear Error'
);
