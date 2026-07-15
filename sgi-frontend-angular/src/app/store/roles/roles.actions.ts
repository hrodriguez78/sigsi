import { createAction, props } from '@ngrx/store';
import { Role } from '../../core/models/index';

export const loadRoles = createAction(
  '[Roles] Load Roles',
  props<{ page?: number; pageSize?: number }>()
);
export const loadRolesSuccess = createAction(
  '[Roles] Load Roles Success',
  props<{ roles: Role[]; total: number }>()
);
export const loadRolesFailure = createAction(
  '[Roles] Load Roles Failure',
  props<{ error: string }>()
);

export const loadRole = createAction(
  '[Roles] Load Role',
  props<{ roleId: string }>()
);
export const loadRoleSuccess = createAction(
  '[Roles] Load Role Success',
  props<{ role: Role }>()
);

export const createRole = createAction(
  '[Roles] Create Role',
  props<{ role: Partial<Role> }>()
);
export const createRoleSuccess = createAction(
  '[Roles] Create Role Success',
  props<{ role: Role }>()
);
export const createRoleFailure = createAction(
  '[Roles] Create Role Failure',
  props<{ error: string }>()
);

export const updateRole = createAction(
  '[Roles] Update Role',
  props<{ roleId: string; changes: Partial<Role> }>()
);
export const updateRoleSuccess = createAction(
  '[Roles] Update Role Success',
  props<{ role: Role }>()
);
export const updateRoleFailure = createAction(
  '[Roles] Update Role Failure',
  props<{ error: string }>()
);

export const deleteRole = createAction(
  '[Roles] Delete Role',
  props<{ roleId: string }>()
);
export const deleteRoleSuccess = createAction(
  '[Roles] Delete Role Success',
  props<{ roleId: string }>()
);
export const deleteRoleFailure = createAction(
  '[Roles] Delete Role Failure',
  props<{ error: string }>()
);

export const loadPermissions = createAction('[Roles] Load Permissions');
export const loadPermissionsSuccess = createAction(
  '[Roles] Load Permissions Success',
  props<{ permissions: string[] }>()
);

export const loadUserRole = createAction(
  '[Roles] Load User Roles',
  props<{ userId: string }>()
);
export const loadUserRoleSuccess = createAction(
  '[Roles] Load User Roles Success',
  props<{ userId: string; roles: string[] }>()
);

export const assignUserRoles = createAction(
  '[Roles] Assign User Roles',
  props<{ userId: string; roleNames: string[] }>()
);
export const assignUserRolesSuccess = createAction(
  '[Roles] Assign User Roles Success',
  props<{ userId: string; roles: string[] }>()
);
