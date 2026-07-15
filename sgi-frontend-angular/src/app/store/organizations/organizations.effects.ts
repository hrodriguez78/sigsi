import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Organization } from '../../core/models';
import * as OrgActions from './organizations.actions';

@Injectable()
export class OrganizationsEffects {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrgActions.loadOrganizations),
      mergeMap(({ page, pageSize, search }) => {
        const params = new URLSearchParams();
        params.set('page', String(page || 1));
        params.set('page_size', String(pageSize || 20));
        if (search) params.set('search', search);
        return this.api
          .get<any>(`/organizations?${params.toString()}`)
          .pipe(
            map((res) =>
              OrgActions.loadOrganizationsSuccess({
                organizations: res.organizations,
                total: res.total,
              })
            ),
            catchError((err) =>
              of(OrgActions.loadOrganizationsFailure({ error: err.error?.detail || 'Error al cargar' }))
            )
          );
      })
    )
  );

  loadOne$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrgActions.loadOrganization),
      mergeMap(({ id }) =>
        this.api.get<Organization>(`/organizations/${id}`).pipe(
          map((org) => OrgActions.loadOrganizationSuccess({ organization: org })),
          catchError((err) =>
            of(OrgActions.loadOrganizationsFailure({ error: err.error?.detail || 'Error' }))
          )
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrgActions.createOrganization),
      mergeMap(({ data }) =>
        this.api.post<Organization>('/organizations', data).pipe(
          map((org) => {
            this.toast.success('Organización creada exitosamente');
            return OrgActions.createOrganizationSuccess({ organization: org });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al crear');
            return of(OrgActions.createOrganizationFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrgActions.updateOrganization),
      mergeMap(({ id, data }) =>
        this.api.put<Organization>(`/organizations/${id}`, data).pipe(
          map((org) => {
            this.toast.success('Organización actualizada');
            return OrgActions.updateOrganizationSuccess({ organization: org });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al actualizar');
            return of(OrgActions.updateOrganizationFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrgActions.deleteOrganization),
      mergeMap(({ id }) =>
        this.api.delete(`/organizations/${id}`).pipe(
          map(() => {
            this.toast.success('Organización eliminada');
            return OrgActions.deleteOrganizationSuccess({ id });
          }),
          catchError((err) => {
            this.toast.error(err.error?.detail || 'Error al eliminar');
            return of(OrgActions.deleteOrganizationFailure({ error: err.error?.detail }));
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private toast: ToastService
  ) {}
}
