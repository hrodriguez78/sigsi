import { createReducer, on } from '@ngrx/store';
import { Audit, AuditFinding, AuditCorrectiveAction, AuditChecklistItem } from '../../core/models';
import * as A from './audits.actions';

export interface AuditsState {
  audits: Audit[];
  currentAudit: Audit | null;
  findings: AuditFinding[];
  correctiveActions: AuditCorrectiveAction[];
  checklist: AuditChecklistItem[];
  stats: any;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}

export const initialState: AuditsState = {
  audits: [],
  currentAudit: null,
  findings: [],
  correctiveActions: [],
  checklist: [],
  stats: null,
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  detailLoading: false,
  error: null,
};

export const auditsReducer = createReducer(
  initialState,
  on(A.loadAudits, s => ({ ...s, loading: true })),
  on(A.loadAuditsSuccess, (s, { audits, total }) => ({ ...s, audits, total, loading: false })),
  on(A.loadAuditsFailure, (s, { error }) => ({ ...s, loading: false, error })),
  on(A.loadAuditStatsSuccess, (s, { stats }) => ({ ...s, stats })),

  on(A.loadAuditById, s => ({ ...s, detailLoading: true })),
  on(A.loadAuditByIdSuccess, (s, { audit }) => ({ ...s, currentAudit: audit, detailLoading: false })),
  on(A.loadAuditByIdFailure, (s, { error }) => ({ ...s, detailLoading: false, error })),

  on(A.createAuditSuccess, (s, { audit }) => ({ ...s, audits: [audit, ...s.audits], total: s.total + 1 })),
  on(A.updateAuditSuccess, (s, { audit }) => ({
    ...s,
    audits: s.audits.map(a => a.id === audit.id ? audit : a),
    currentAudit: s.currentAudit?.id === audit.id ? audit : s.currentAudit,
  })),
  on(A.deleteAuditSuccess, (s, { id }) => ({ ...s, audits: s.audits.filter(a => a.id !== id), total: s.total - 1 })),

  on(A.loadAuditFindings, s => ({ ...s })),
  on(A.loadAuditFindingsSuccess, (s, { findings }) => ({ ...s, findings })),
  on(A.loadAuditFindingsFailure, (s, { error }) => ({ ...s, error })),

  on(A.addAuditFindingSuccess, (s, { finding }) => ({ ...s, findings: [...s.findings, finding] })),

  on(A.loadAuditChecklist, s => ({ ...s })),
  on(A.loadAuditChecklistSuccess, (s, { checklist }) => ({ ...s, checklist })),
  on(A.loadAuditChecklistFailure, (s, { error }) => ({ ...s, error })),

  on(A.addAuditChecklistItemSuccess, (s, { item }) => ({ ...s, checklist: [...s.checklist, item] })),

  on(A.loadAuditCorrectiveActions, s => ({ ...s })),
  on(A.loadAuditCorrectiveActionsSuccess, (s, { actions }) => ({ ...s, correctiveActions: actions })),
  on(A.loadAuditCorrectiveActionsFailure, (s, { error }) => ({ ...s, error })),

  on(A.addAuditCorrectiveActionSuccess, (s, { correctiveAction }) => ({
    ...s,
    correctiveActions: [...s.correctiveActions, correctiveAction],
  })),
  on(A.updateAuditCorrectiveActionSuccess, (s, { correctiveAction }) => ({
    ...s,
    correctiveActions: s.correctiveActions.map(ca =>
      ca.id === correctiveAction.id ? correctiveAction : ca
    ),
  })),
);
