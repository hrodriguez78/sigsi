import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrganizationsState } from './organizations.reducer';

export const selectOrganizationsState =
  createFeatureSelector<OrganizationsState>('organizations');

export const selectOrganizations = createSelector(
  selectOrganizationsState,
  (state) => state.organizations
);

export const selectSelectedOrganization = createSelector(
  selectOrganizationsState,
  (state) => state.selected
);

export const selectOrganizationsTotal = createSelector(
  selectOrganizationsState,
  (state) => state.total
);

export const selectOrganizationsLoading = createSelector(
  selectOrganizationsState,
  (state) => state.loading
);

export const selectOrganizationsError = createSelector(
  selectOrganizationsState,
  (state) => state.error
);

export const selectOrganizationsPage = createSelector(
  selectOrganizationsState,
  (state) => ({ page: state.page, pageSize: state.pageSize, search: state.search })
);
