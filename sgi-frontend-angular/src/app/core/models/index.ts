export interface User {
  id: string;
  email: string;
  full_name: string;
  organization_id?: string;
  roles: string[];
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface Organization {
  id: string;
  name: string;
  nit: string;
  description: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Process {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description: string;
  process_type: 'estrategico' | 'tactico' | 'operativo' | 'soporte';
  parent_id?: string;
  owner_id?: string;
  objective: string;
  scope: string;
  status: 'activo' | 'inactivo' | 'borrador' | 'en_revision';
  risk_level: 'bajo' | 'medio' | 'alto' | 'critico';
  tags: string[];
  created_at: string;
  updated_at: string;
  children?: Process[];
}

export interface CIAClassification {
  confidentiality: number;
  integrity: number;
  availability: number;
}

export interface Asset {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description: string;
  asset_type: 'hardware' | 'software' | 'informacion' | 'servicio' | 'red' | 'personal' | 'instalacion';
  criticality: 'bajo' | 'medio' | 'alto' | 'critico';
  cia: CIAClassification;
  process_id?: string;
  owner_id?: string;
  location: string;
  brand: string;
  model: string;
  serial_number: string;
  ip_address: string;
  operating_system: string;
  responsible_user_id?: string;
  acquisition_date?: string;
  warranty_until?: string;
  cost?: number;
  status: string;
  tags: string[];
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  version: number;
  content: string;
  change_notes: string;
  created_by?: string;
  created_at: string;
}

export interface DocumentApproval {
  reviewer_id: string;
  status: string;
  comments: string;
  reviewed_at: string;
}

export interface Document {
  id: string;
  organization_id: string;
  title: string;
  code: string;
  description: string;
  document_type: 'politica' | 'procedimiento' | 'lineamiento' | 'manual' | 'formato' | 'registro' | 'plan' | 'reporte' | 'otro';
  process_id?: string;
  current_version: number;
  status: 'borrador' | 'en_revision' | 'aprobado' | 'publicado' | 'archivado' | 'obsoleto';
  tags: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface DocumentDetail extends Document {
  content: string;
  versions: DocumentVersion[];
  approvals: DocumentApproval[];
}

export interface Risk {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description: string;
  category: 'estrategico' | 'operativo' | 'cumplimiento' | 'financiero' | 'reputacional' | 'tecnico';
  asset_id?: string;
  process_id?: string;
  source: string;
  consequence: string;
  probability: number;
  impact: number;
  risk_level: 'bajo' | 'medio' | 'alto' | 'critico';
  risk_score: number;
  treatment?: 'mitigar' | 'transferir' | 'evitar' | 'aceptar';
  treatment_plan: string;
  owner_id?: string;
  status: 'identificado' | 'en_analisis' | 'en_tratamiento' | 'en_seguimiento' | 'aceptado' | 'cerrado';
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Control {
  id: string;
  organization_id: string;
  control_id: string;
  name: string;
  description: string;
  category: 'organizativo' | 'personas' | 'fisico' | 'tecnologico';
  annex_a?: string;
  iso_clause?: string;
  implementation_status: 'no_iniciado' | 'en_progreso' | 'implementado' | 'efectivo' | 'no_aplicable';
  compliance_level: 'total' | 'parcial' | 'minimo' | 'ninguno' | 'no_evaluado';
  responsible_id?: string;
  evidence_description: string;
  notes: string;
  tags: string[];
  evidence_count: number;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  incident_type: 'seguridad' | 'disponibilidad' | 'brecha_datos' | 'malware' | 'phishing' | 'acceso_no_autorizado' | 'configuracion' | 'error_humano' | 'otro';
  severity: 'bajo' | 'medio' | 'alto' | 'critico';
  priority: 'p1_critico' | 'p2_alto' | 'p3_medio' | 'p4_bajo';
  status: 'abierto' | 'en_investigacion' | 'contenido' | 'erradicado' | 'recuperado' | 'cerrado';
  assigned_to?: string;
  affected_assets: string[];
  affected_processes: string[];
  reported_by?: string;
  detection_method: string;
  root_cause?: string;
  containment_actions?: string;
  lessons_learned?: string;
  resolved_at?: string;
  tags: string[];
  comments_count: number;
  comments: { text: string; author: string; created_at: string }[];
  created_at: string;
  updated_at: string;
}

export type IncidentType = Incident['incident_type'];
export type IncidentSeverity = Incident['severity'];
export type IncidentPriority = Incident['priority'];
export type IncidentStatus = Incident['status'];

export interface Audit {
  id: string;
  organization_id: string;
  title: string;
  audit_type: 'interna' | 'externa' | 'proveedor' | 'autoevaluacion';
  scope: string;
  criteria: string;
  planned_date?: string;
  start_date?: string;
  end_date?: string;
  status: 'planificada' | 'en_curso' | 'completada' | 'reporte_cerrado';
  auditor_name?: string;
  auditor_email?: string;
  team_members: string[];
  processes_to_audit: string[];
  summary?: string;
  notes: string;
  findings_count: number;
  non_conformities_count: number;
  created_at: string;
  updated_at: string;
}

export interface AuditFinding {
  id: string;
  audit_id: string;
  title: string;
  finding_type: 'no_conformidad' | 'observacion' | 'oportunidad_mejora' | 'buena_practica';
  severity: 'bajo' | 'medio' | 'alto' | 'critico';
  description: string;
  evidence?: string;
  requirement?: string;
  status: 'abierta' | 'en_seguimiento' | 'cerrada';
  created_at: string;
  updated_at: string;
}

export interface AuditCorrectiveAction {
  id: string;
  finding_id: string;
  audit_id: string;
  action: string;
  responsible: string;
  deadline: string;
  status: 'pendiente' | 'en_progreso' | 'completada' | 'verificada';
  evidence?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditChecklistItem {
  id: string;
  audit_id: string;
  control_reference: string;
  description: string;
  status: 'cumple' | 'no_cumple' | 'no_aplicable' | 'pendiente';
  observation?: string;
  evaluated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  [key: string]: T[] | number;
}

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date' | 'actions';
  badgeMap?: Record<string, { label: string; class: string }>;
}

export interface Course {
  id: string;
  organization_id: string;
  code: string;
  title: string;
  description: string;
  category: 'concienciacion' | 'tecnico' | 'cumplimiento' | 'liderazgo' | 'emergencias' | 'otro';
  status: 'borrador' | 'publicado' | 'en_curso' | 'completado' | 'archivado';
  duration_hours: number;
  instructor?: string;
  max_participants?: number;
  start_date?: string;
  end_date?: string;
  location?: string;
  is_mandatory: boolean;
  tags: string[];
  enrollments_count: number;
  completed_count: number;
  avg_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  status: 'inscrito' | 'en_curso' | 'completado' | 'reprobado' | 'cancelado';
  progress: number;
  score?: number;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface RaciMatrix {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  process_ids: string[];
  role_names: string[];
  assignments: { [processId: string]: { [roleName: string]: string } };
  created_at: string;
  updated_at: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  icon?: string;
  color?: string;
  size: 'small' | 'medium' | 'large';
  enabled: boolean;
  order: number;
  config?: Record<string, any>;
}

export interface WidgetLayout {
  id?: string;
  user_id: string;
  organization_id?: string;
  widgets: WidgetConfig[];
  columns: number;
}

export interface OrgPosition {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  holder_name?: string;
  holder_email?: string;
  level: number;
  order: number;
  department?: string;
  responsibilities: string[];
  created_at: string;
  updated_at: string;
}

export interface OrgTreeNode {
  id: string;
  name: string;
  description?: string;
  holder_name?: string;
  holder_email?: string;
  department?: string;
  responsibilities: string[];
  level: number;
  children: OrgTreeNode[];
}

export interface OrgChartResponse {
  organization_id: string;
  tree: OrgTreeNode | null;
  positions: OrgPosition[];
}
