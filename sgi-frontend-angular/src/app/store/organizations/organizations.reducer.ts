import { createReducer, on } from '@ngrx/store';
import { Organization } from '../../core/models';
import * as OrgActions from './organizations.actions';

export interface OrganizationsState {
  organizations: Organization[];
  selected: Organization | null;
  total: number;
  page: number;
  pageSize: number;
  search: string;
  loading: boolean;
  error: string | null;
}

export const initialState: OrganizationsState = {
  organizations: [],
  selected: null,
  total: 0,
  page: 1,
  pageSize: 20,
  search: '',
  loading: false,
  error: null,
};

export const organizationsReducer = createReducer(
  initialState,

  on(OrgActions.loadOrganizations, (state, { page, pageSize, search }) => ({
    ...state,
    page: page ?? state.page,
    pageSize: pageSize ?? state.pageSize,
    search: search ?? state.search,
    loading: true,
    error: null,
  })),

  on(OrgActions.loadOrganizationsSuccess, (state, { organizations, total }) => ({
    ...state,
    organizations,
    total,
    loading: false,
  })),

  on(OrgActions.loadOrganizationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(OrgActions.loadOrganizationSuccess, (state, { organization }) => ({
    ...state,
    selected: organization,
    loading: false,
  })),

  on(OrgActions.createOrganizationSuccess, (state, { organization }) => ({
    ...state,
    organizations: [organization, ...state.organizations],
    total: state.total + 1,
  })),

  on(OrgActions.updateOrganizationSuccess, (state, { organization }) => ({
    ...state,
    organizations: state.organizations.map((o) =>
      o.id === organization.id ? organization : o
    ),
    selected:
      state.selected?.id === organization.id ? organization : state.selected,
  })),

  on(OrgActions.deleteOrganizationSuccess, (state, { id }) => ({
    ...state,
    organizations: state.organizations.filter((o) => o.id !== id),
    total: state.total - 1,
    selected:
      state.selected?.id === id ? null : state.selected,
  })),

  on(OrgActions.setSelectedOrganization, (state, { id }) => ({
    ...state,
    selected: id
      ? state.organizations.find((o) => o.id === id) || null
      : null,
  })),

  on(OrgActions.clearOrganizationError, (state) => ({
    ...state,
    error: null,
  }))
);
