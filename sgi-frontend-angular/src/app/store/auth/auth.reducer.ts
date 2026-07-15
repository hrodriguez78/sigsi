import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/models';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
};

export const authReducer = createReducer(
  initialState,

  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AuthActions.loginSuccess, (state, { token, user }) => ({
    ...state,
    token: token.access_token,
    user,
    loading: false,
    error: null,
    isAuthenticated: true,
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isAuthenticated: false,
  })),

  on(AuthActions.loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
  })),

  on(AuthActions.loadUserFailure, (state) => ({
    ...state,
    user: null,
    loading: false,
  })),

  on(AuthActions.logout, () => ({
    ...initialState,
    token: null,
    isAuthenticated: false,
  })),

  on(AuthActions.tokenExpired, () => ({
    ...initialState,
    token: null,
    isAuthenticated: false,
  }))
);
