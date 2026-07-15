import { createAction, props } from '@ngrx/store';
import { RaciMatrix } from '../../core/models';

export const loadRaciMatrices = createAction(
  '[RACI] Load',
  props<{ organizationId: string; page?: number; pageSize?: number; search?: string }>()
);

export const loadRaciMatricesSuccess = createAction(
  '[RACI] Load Success',
  props<{ matrices: RaciMatrix[]; total: number }>()
);

export const loadRaciMatricesFailure = createAction(
  '[RACI] Load Failure',
  props<{ error: string }>()
);

export const loadRaciMatrixById = createAction(
  '[RACI] Load By Id',
  props<{ id: string }>()
);

export const loadRaciMatrixByIdSuccess = createAction(
  '[RACI] Load By Id Success',
  props<{ matrix: RaciMatrix }>()
);

export const createRaciMatrix = createAction(
  '[RACI] Create',
  props<{ data: Partial<RaciMatrix> }>()
);

export const createRaciMatrixSuccess = createAction(
  '[RACI] Create Success',
  props<{ matrix: RaciMatrix }>()
);

export const updateRaciMatrix = createAction(
  '[RACI] Update',
  props<{ id: string; data: Partial<RaciMatrix> }>()
);

export const updateRaciMatrixSuccess = createAction(
  '[RACI] Update Success',
  props<{ matrix: RaciMatrix }>()
);

export const deleteRaciMatrix = createAction(
  '[RACI] Delete',
  props<{ id: string }>()
);

export const deleteRaciMatrixSuccess = createAction(
  '[RACI] Delete Success',
  props<{ id: string }>()
);
