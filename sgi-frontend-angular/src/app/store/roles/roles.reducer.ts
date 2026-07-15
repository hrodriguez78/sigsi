import { createReducer, on } from '@ngrx/store';
import * as RolesActions from './roles.actions';
import { Role } from '../../core/models/index';

export interface RolesState {
  roles: Role[];
  total: number;
  selectedRole: Role | null;
  permissions: string[];
  userRoles: Record<string, string[]>;
  loading: boolean;
  error: string | null;
}

export const initialState: RolesState = {
  roles: [],
  total: 0,
  selectedRole: null,
  permissions: [],
  userRoles: {},
  loading: false,
  error: null,
};

export const rolesReducer = createReducer(
  initialState,
  on(RolesActions.loadRoles, (state) => ({ ...state, loading: true, error: null })),
  on(RolesActions.loadRolesSuccess, (state, { roles, total }) => ({
    ...state, roles, total, loading: false,
  })),
  on(RolesActions.loadRolesFailure, (state, { error }) => ({
    ...state, error, loading: false,
  })),
  on(RolesActions.loadRoleSuccess, (state, { role }) => ({
    ...state, selectedRole: role, loading: false,
  })),
  on(RolesActions.createRoleSuccess, (state, { role }) => ({
    ...state, roles: [role, ...state.roles], total: state.total + 1,
  })),
  on(RolesActions.updateRoleSuccess, (state, { role }) => ({
    ...state,
    roles: state.roles.map((r) => (r.id === role.id ? role : r)),
    selectedRole: role,
  })),
  on(RolesActions.deleteRoleSuccess, (state, { roleId }) => ({
    ...state,
    roles: state.roles.filter((r) => r.id !== roleId),
    total: state.total - 1,
  })),
  on(RolesActions.loadPermissionsSuccess, (state, { permissions }) => ({
    ...state, permissions,
  })),
  on(RolesActions.loadUserRoleSuccess, (state, { userId, roles }) => ({
    ...state, userRoles: { ...state.userRoles, [userId]: roles },
  })),
  on(RolesActions.assignUserRolesSuccess, (state, { userId, roles }) => ({
    ...state, userRoles: { ...state.userRoles, [userId]: roles },
  })),
);
