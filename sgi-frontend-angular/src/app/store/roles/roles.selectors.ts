import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RolesState } from './roles.reducer';

export const selectRolesState = createFeatureSelector<RolesState>('roles');
export const selectRoles = createSelector(selectRolesState, (s) => s.roles);
export const selectRolesTotal = createSelector(selectRolesState, (s) => s.total);
export const selectRolesLoading = createSelector(selectRolesState, (s) => s.loading);
export const selectSelectedRole = createSelector(selectRolesState, (s) => s.selectedRole);
export const selectPermissions = createSelector(selectRolesState, (s) => s.permissions);
export const selectUserRoles = createSelector(selectRolesState, (s) => s.userRoles);
