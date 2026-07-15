import { createAction, props } from '@ngrx/store';
import { Audit, AuditFinding, AuditCorrectiveAction, AuditChecklistItem } from '../../core/models';

export const loadAudits = createAction('[Audits] Load', props<{ organizationId: string; page?: number; pageSize?: number; search?: string; auditType?: string; status?: string }>());
export const loadAuditsSuccess = createAction('[Audits] Load Success', props<{ audits: Audit[]; total: number }>());
export const loadAuditsFailure = createAction('[Audits] Load Failure', props<{ error: string }>());

export const loadAuditStats = createAction('[Audits] Load Stats', props<{ organizationId: string }>());
export const loadAuditStatsSuccess = createAction('[Audits] Load Stats Success', props<{ stats: any }>());

export const loadAuditById = createAction('[Audits] Load By Id', props<{ id: string }>());
export const loadAuditByIdSuccess = createAction('[Audits] Load By Id Success', props<{ audit: Audit }>());
export const loadAuditByIdFailure = createAction('[Audits] Load By Id Failure', props<{ error: string }>());

export const createAudit = createAction('[Audits] Create', props<{ data: Partial<Audit> }>());
export const createAuditSuccess = createAction('[Audits] Create Success', props<{ audit: Audit }>());
export const createAuditFailure = createAction('[Audits] Create Failure', props<{ error: string }>());
export const updateAudit = createAction('[Audits] Update', props<{ id: string; data: Partial<Audit> }>());
export const updateAuditSuccess = createAction('[Audits] Update Success', props<{ audit: Audit }>());
export const updateAuditFailure = createAction('[Audits] Update Failure', props<{ error: string }>());
export const deleteAudit = createAction('[Audits] Delete', props<{ id: string }>());
export const deleteAuditSuccess = createAction('[Audits] Delete Success', props<{ id: string }>());

export const loadAuditFindings = createAction('[Audits] Load Findings', props<{ auditId: string }>());
export const loadAuditFindingsSuccess = createAction('[Audits] Load Findings Success', props<{ findings: AuditFinding[] }>());
export const loadAuditFindingsFailure = createAction('[Audits] Load Findings Failure', props<{ error: string }>());

export const addAuditFinding = createAction('[Audits] Add Finding', props<{ auditId: string; data: Partial<AuditFinding> }>());
export const addAuditFindingSuccess = createAction('[Audits] Add Finding Success', props<{ finding: AuditFinding }>());
export const addAuditFindingFailure = createAction('[Audits] Add Finding Failure', props<{ error: string }>());

export const loadAuditChecklist = createAction('[Audits] Load Checklist', props<{ auditId: string }>());
export const loadAuditChecklistSuccess = createAction('[Audits] Load Checklist Success', props<{ checklist: AuditChecklistItem[] }>());
export const loadAuditChecklistFailure = createAction('[Audits] Load Checklist Failure', props<{ error: string }>());

export const addAuditChecklistItem = createAction('[Audits] Add Checklist Item', props<{ auditId: string; data: Partial<AuditChecklistItem> }>());
export const addAuditChecklistItemSuccess = createAction('[Audits] Add Checklist Item Success', props<{ item: AuditChecklistItem }>());
export const addAuditChecklistItemFailure = createAction('[Audits] Add Checklist Item Failure', props<{ error: string }>());

export const loadAuditCorrectiveActions = createAction('[Audits] Load Corrective Actions', props<{ auditId: string }>());
export const loadAuditCorrectiveActionsSuccess = createAction('[Audits] Load Corrective Actions Success', props<{ actions: AuditCorrectiveAction[] }>());
export const loadAuditCorrectiveActionsFailure = createAction('[Audits] Load Corrective Actions Failure', props<{ error: string }>());

export const addAuditCorrectiveAction = createAction('[Audits] Add Corrective Action', props<{ auditId: string; data: Partial<AuditCorrectiveAction> }>());
export const addAuditCorrectiveActionSuccess = createAction('[Audits] Add Corrective Action Success', props<{ correctiveAction: AuditCorrectiveAction }>());
export const addAuditCorrectiveActionFailure = createAction('[Audits] Add Corrective Action Failure', props<{ error: string }>());

export const updateAuditCorrectiveAction = createAction('[Audits] Update Corrective Action', props<{ id: string; data: Partial<AuditCorrectiveAction> }>());
export const updateAuditCorrectiveActionSuccess = createAction('[Audits] Update Corrective Action Success', props<{ correctiveAction: AuditCorrectiveAction }>());
export const updateAuditCorrectiveActionFailure = createAction('[Audits] Update Corrective Action Failure', props<{ error: string }>());
