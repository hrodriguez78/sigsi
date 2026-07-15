import { createAction, props } from '@ngrx/store';

export interface Candidate {
  id: string;
  organization_id: string;
  process_id: string;
  full_name: string;
  email: string;
  phone: string;
  position_applied: string;
  cover_letter: string;
  source: string;
  status: string;
  notes: string;
  score: number;
  documents_count: number;
  tests_completed: number;
  created_at: string;
  updated_at: string;
}

export interface CandidateDocument {
  id: string;
  candidate_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  notes: string;
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface CandidateTest {
  id: string;
  candidate_id: string;
  test_type: string;
  test_name: string;
  max_score: number;
  score: number | null;
  status: string;
  instructions: string;
  duration_minutes: number;
  questions: any[];
  answers: any[];
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateActivity {
  id: string;
  candidate_id: string;
  activity_type: string;
  description: string;
  performed_by: string;
  created_at: string;
}

export interface PipelineStats {
  total: number;
  new: number;
  in_review: number;
  approved: number;
  rejected: number;
  hired: number;
  withdrawn: number;
  avg_score: number;
}

// ── Load Candidates ──
export const loadCandidates = createAction(
  '[Candidates] Load',
  props<{
    organizationId: string;
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    processId?: string;
  }>()
);

export const loadCandidatesSuccess = createAction(
  '[Candidates] Load Success',
  props<{ candidates: Candidate[]; total: number }>()
);

export const loadCandidatesFailure = createAction(
  '[Candidates] Load Failure',
  props<{ error: string }>()
);

// ── Load Pipeline Stats ──
export const loadPipelineStats = createAction(
  '[Candidates] Load Pipeline Stats',
  props<{ organizationId: string }>()
);

export const loadPipelineStatsSuccess = createAction(
  '[Candidates] Load Pipeline Stats Success',
  props<{ stats: PipelineStats }>()
);

// ── Load Single Candidate ──
export const loadCandidate = createAction(
  '[Candidates] Load One',
  props<{ id: string }>()
);

export const loadCandidateSuccess = createAction(
  '[Candidates] Load One Success',
  props<{ candidate: Candidate }>()
);

// ── Create ──
export const createCandidate = createAction(
  '[Candidates] Create',
  props<{ data: Partial<Candidate> }>()
);

export const createCandidateSuccess = createAction(
  '[Candidates] Create Success',
  props<{ candidate: Candidate }>()
);

// ── Update ──
export const updateCandidate = createAction(
  '[Candidates] Update',
  props<{ id: string; data: Partial<Candidate> }>()
);

export const updateCandidateSuccess = createAction(
  '[Candidates] Update Success',
  props<{ candidate: Candidate }>()
);

// ── Delete ──
export const deleteCandidate = createAction(
  '[Candidates] Delete',
  props<{ id: string }>()
);

export const deleteCandidateSuccess = createAction(
  '[Candidates] Delete Success',
  props<{ id: string }>()
);

// ── Documents ──
export const loadDocuments = createAction(
  '[Candidates] Load Documents',
  props<{ candidateId: string }>()
);

export const loadDocumentsSuccess = createAction(
  '[Candidates] Load Documents Success',
  props<{ documents: CandidateDocument[] }>()
);

export const addDocument = createAction(
  '[Candidates] Add Document',
  props<{ candidateId: string; data: Partial<CandidateDocument> }>()
);

export const addDocumentSuccess = createAction(
  '[Candidates] Add Document Success',
  props<{ document: CandidateDocument }>()
);

export const verifyDocument = createAction(
  '[Candidates] Verify Document',
  props<{ docId: string }>()
);

export const verifyDocumentSuccess = createAction(
  '[Candidates] Verify Document Success',
  props<{ document: CandidateDocument }>()
);

// ── Tests ──
export const loadTests = createAction(
  '[Candidates] Load Tests',
  props<{ candidateId: string }>()
);

export const loadTestsSuccess = createAction(
  '[Candidates] Load Tests Success',
  props<{ tests: CandidateTest[] }>()
);

export const addTest = createAction(
  '[Candidates] Add Test',
  props<{ candidateId: string; data: Partial<CandidateTest> }>()
);

export const addTestSuccess = createAction(
  '[Candidates] Add Test Success',
  props<{ test: CandidateTest }>()
);

export const updateTest = createAction(
  '[Candidates] Update Test',
  props<{ testId: string; data: Partial<CandidateTest> }>()
);

export const updateTestSuccess = createAction(
  '[Candidates] Update Test Success',
  props<{ test: CandidateTest }>()
);

// ── Activities ──
export const loadActivities = createAction(
  '[Candidates] Load Activities',
  props<{ candidateId: string }>()
);

export const loadActivitiesSuccess = createAction(
  '[Candidates] Load Activities Success',
  props<{ activities: CandidateActivity[] }>()
);

export const addActivity = createAction(
  '[Candidates] Add Activity',
  props<{ candidateId: string; data: { activity_type: string; description: string } }>()
);

export const addActivitySuccess = createAction(
  '[Candidates] Add Activity Success',
  props<{ activity: CandidateActivity }>()
);

// ── Selected Candidate ──
export const setSelectedCandidate = createAction(
  '[Candidates] Set Selected',
  props<{ id: string | null }>()
);
