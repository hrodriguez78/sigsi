import { createAction, props } from '@ngrx/store';
import { Process } from '../../core/models';

export const loadProcesses = createAction(
  '[Processes] Load',
  props<{
    organizationId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    processType?: string;
    status?: string;
  }>()
);

export const loadProcessesSuccess = createAction(
  '[Processes] Load Success',
  props<{ processes: Process[]; total: number }>()
);

export const loadProcessesFailure = createAction(
  '[Processes] Load Failure',
  props<{ error: string }>()
);

export const loadProcessTree = createAction(
  '[Processes] Load Tree',
  props<{ organizationId: string }>()
);

export const loadProcessTreeSuccess = createAction(
  '[Processes] Load Tree Success',
  props<{ tree: Process[] }>()
);

export const createProcess = createAction(
  '[Processes] Create',
  props<{ data: Partial<Process> }>()
);

export const createProcessSuccess = createAction(
  '[Processes] Create Success',
  props<{ process: Process }>()
);

export const createProcessFailure = createAction(
  '[Processes] Create Failure',
  props<{ error: string }>()
);

export const updateProcess = createAction(
  '[Processes] Update',
  props<{ id: string; data: Partial<Process> }>()
);

export const updateProcessSuccess = createAction(
  '[Processes] Update Success',
  props<{ process: Process }>()
);

export const updateProcessFailure = createAction(
  '[Processes] Update Failure',
  props<{ error: string }>()
);

export const deleteProcess = createAction(
  '[Processes] Delete',
  props<{ id: string }>()
);

export const deleteProcessSuccess = createAction(
  '[Processes] Delete Success',
  props<{ id: string }>()
);

export const deleteProcessFailure = createAction(
  '[Processes] Delete Failure',
  props<{ error: string }>()
);

export const setSelectedProcess = createAction(
  '[Processes] Set Selected',
  props<{ id: string | null }>()
);
