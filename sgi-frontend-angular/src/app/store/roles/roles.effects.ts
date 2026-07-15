import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as RolesActions from './roles.actions';

@Injectable()
export class RolesEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  loadRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.loadRoles),
      switchMap(({ page = 1, pageSize = 50 }) => {
        const params = new HttpParams()
          .set('page', page.toString())
          .set('page_size', pageSize.toString());
        return this.http.get<any>('/api/v1/roles', { params }).pipe(
          map((roles) => RolesActions.loadRolesSuccess({ roles, total: roles.length })),
          catchError((err) => of(RolesActions.loadRolesFailure({ error: err.error?.detail || 'Error' })))
        );
      })
    )
  );

  loadRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.loadRole),
      switchMap(({ roleId }) =>
        this.http.get<any>(`/api/v1/roles/${roleId}`).pipe(
          map((role) => RolesActions.loadRoleSuccess({ role })),
          catchError(() => of())
        )
      )
    )
  );

  createRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.createRole),
      switchMap(({ role }) =>
        this.http.post<any>('/api/v1/roles', role).pipe(
          map((created) => RolesActions.createRoleSuccess({ role: created })),
          catchError((err) => of(RolesActions.createRoleFailure({ error: err.error?.detail || 'Error' })))
        )
      )
    )
  );

  updateRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.updateRole),
      switchMap(({ roleId, changes }) =>
        this.http.put<any>(`/api/v1/roles/${roleId}`, changes).pipe(
          map((updated) => RolesActions.updateRoleSuccess({ role: updated })),
          catchError((err) => of(RolesActions.updateRoleFailure({ error: err.error?.detail || 'Error' })))
        )
      )
    )
  );

  deleteRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.deleteRole),
      switchMap(({ roleId }) =>
        this.http.delete(`/api/v1/roles/${roleId}`).pipe(
          map(() => RolesActions.deleteRoleSuccess({ roleId })),
          catchError((err) => of(RolesActions.deleteRoleFailure({ error: err.error?.detail || 'Error' })))
        )
      )
    )
  );

  loadPermissions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.loadPermissions),
      switchMap(() =>
        this.http.get<any>('/api/v1/roles/permissions').pipe(
          map((res) => RolesActions.loadPermissionsSuccess({ permissions: res.permissions })),
          catchError(() => of(RolesActions.loadPermissionsSuccess({ permissions: [] })))
        )
      )
    )
  );

  loadUserRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.loadUserRole),
      switchMap(({ userId }) =>
        this.http.get<any>(`/api/v1/roles/users/${userId}`).pipe(
          map((res) => RolesActions.loadUserRoleSuccess({ userId: res.user_id, roles: res.roles })),
          catchError(() => of())
        )
      )
    )
  );

  assignUserRoles$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RolesActions.assignUserRoles),
      switchMap(({ userId, roleNames }) =>
        this.http.put<any>(`/api/v1/roles/users/${userId}`, { role_names: roleNames }).pipe(
          map((res) => RolesActions.assignUserRolesSuccess({ userId: res.user_id, roles: res.roles })),
          catchError(() => of())
        )
      )
    )
  );
}
