import { ActionReducerMap } from '@ngrx/store';
import { AuthState, authReducer } from './auth/auth.reducer';
import { OrganizationsState, organizationsReducer } from './organizations/organizations.reducer';
import { ProcessesState, processesReducer } from './processes/processes.reducer';
import { AssetsState, assetsReducer } from './assets/assets.reducer';
import { DocumentsState, documentsReducer } from './documents/documents.reducer';
import { RisksState, risksReducer } from './risks/risks.reducer';
import { ControlsState, controlsReducer } from './controls/controls.reducer';
import { IncidentsState, incidentsReducer } from './incidents/incidents.reducer';
import { AuditsState, auditsReducer } from './audits/audits.reducer';
import { TrainingState, trainingReducer } from './training/training.reducer';
import { RolesState, rolesReducer } from './roles/roles.reducer';
import { DashboardState, dashboardReducer } from './dashboard/dashboard.reducer';
import { AIState, aiReducer } from './ai/ai.reducer';
import { RaciState, raciReducer } from './raci/raci.reducer';
import { WidgetsState, widgetsReducer } from './widgets/widgets.reducer';
import { OrgChartState, orgchartReducer } from './orgchart/orgchart.reducer';
import { CandidatesState, candidatesReducer } from './candidates/candidates.reducer';

export interface AppState {
  auth: AuthState;
  organizations: OrganizationsState;
  processes: ProcessesState;
  assets: AssetsState;
  documents: DocumentsState;
  risks: RisksState;
  controls: ControlsState;
  incidents: IncidentsState;
  audits: AuditsState;
  training: TrainingState;
  roles: RolesState;
  dashboard: DashboardState;
  ai: AIState;
  raci: RaciState;
  widgets: WidgetsState;
  orgchart: OrgChartState;
  candidates: CandidatesState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  organizations: organizationsReducer,
  processes: processesReducer,
  assets: assetsReducer,
  documents: documentsReducer,
  risks: risksReducer,
  controls: controlsReducer,
  incidents: incidentsReducer,
  audits: auditsReducer,
  training: trainingReducer,
  roles: rolesReducer,
  dashboard: dashboardReducer,
  ai: aiReducer,
  raci: raciReducer,
  widgets: widgetsReducer,
  orgchart: orgchartReducer,
  candidates: candidatesReducer,
};
