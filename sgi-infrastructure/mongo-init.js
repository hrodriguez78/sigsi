db = db.getSiblingDB("sgi_db");

db.createCollection("users");
db.createCollection("organizations");
db.createCollection("documents");
db.createCollection("risks");
db.createCollection("assets");
db.createCollection("incidents");
db.createCollection("audits");
db.createCollection("controls");
db.createCollection("processes");

db.users.createIndex({ email: 1 }, { unique: true });
db.organizations.createIndex({ nit: 1 }, { unique: true });
db.documents.createIndex({ organization_id: 1 });
db.risks.createIndex({ organization_id: 1 });
db.assets.createIndex({ organization_id: 1 });
db.assets.createIndex({ organization_id: 1, asset_type: 1 });
db.assets.createIndex({ organization_id: 1, criticality: 1 });
db.assets.createIndex({ organization_id: 1, name: 1 });
db.assets.createIndex({ organization_id: 1, process_id: 1 });
db.incidents.createIndex({ organization_id: 1, created_at: -1 });
db.audits.createIndex({ organization_id: 1, created_at: -1 });
db.controls.createIndex({ control_id: 1 }, { unique: true });
db.processes.createIndex({ organization_id: 1 });
db.processes.createIndex({ organization_id: 1, parent_id: 1 });
db.processes.createIndex({ organization_id: 1, name: 1 });

db.risks.createIndex({ organization_id: 1, risk_score: -1 });
db.risks.createIndex({ organization_id: 1, risk_level: 1 });
db.risks.createIndex({ organization_id: 1, category: 1 });

db.controls.createIndex({ organization_id: 1, control_id: 1 }, { unique: true });
db.controls.createIndex({ organization_id: 1, category: 1 });
db.controls.createIndex({ organization_id: 1, implementation_status: 1 });

db.incidents.createIndex({ organization_id: 1, severity: 1 });
db.incidents.createIndex({ organization_id: 1, status: 1 });

db.audits.createIndex({ organization_id: 1, status: 1 });
db.audits.createIndex({ organization_id: 1, audit_type: 1 });

db.createCollection("courses");
db.createCollection("enrollments");

db.courses.createIndex({ organization_id: 1 });
db.courses.createIndex({ organization_id: 1, code: 1 }, { unique: true });
db.courses.createIndex({ organization_id: 1, category: 1 });
db.courses.createIndex({ organization_id: 1, status: 1 });

db.enrollments.createIndex({ course_id: 1 });
db.enrollments.createIndex({ course_id: 1, user_id: 1 });
db.enrollments.createIndex({ user_id: 1 });
db.enrollments.createIndex({ status: 1 });

db.createCollection("roles");
db.roles.createIndex({ name: 1 }, { unique: true });
db.roles.createIndex({ created_at: 1 });

db.createCollection("ai_chat_sessions");
db.ai_chat_sessions.createIndex({ user_id: 1 });
db.ai_chat_sessions.createIndex({ user_id: 1, updated_at: -1 });

db.createCollection("ai_suggestions");
db.ai_suggestions.createIndex({ user_id: 1 });
db.ai_suggestions.createIndex({ module: 1 });
db.ai_suggestions.createIndex({ created_at: -1 });

db.createCollection("raci_matrices");
db.raci_matrices.createIndex({ organization_id: 1 });
db.raci_matrices.createIndex({ organization_id: 1, name: 1 });
db.raci_matrices.createIndex({ created_at: -1 });

db.createCollection("risk_treatments");
db.risk_treatments.createIndex({ risk_id: 1 });

db.createCollection("control_evidence");
db.control_evidence.createIndex({ control_id: 1 });

db.createCollection("audit_findings");
db.audit_findings.createIndex({ audit_id: 1 });

db.createCollection("audit_corrective_actions");
db.audit_corrective_actions.createIndex({ audit_id: 1 });

db.createCollection("audit_checklist");
db.audit_checklist.createIndex({ audit_id: 1 });

db.createCollection("enrollments");
db.enrollments.createIndex({ course_id: 1 });
db.enrollments.createIndex({ user_id: 1 });

db.createCollection("widget_layouts");
db.widget_layouts.createIndex({ user_id: 1 }, { unique: true });
db.widget_layouts.createIndex({ user_id: 1, organization_id: 1 });

db.createCollection("org_positions");
db.org_positions.createIndex({ organization_id: 1 });
db.org_positions.createIndex({ organization_id: 1, parent_id: 1 });
db.org_positions.createIndex({ organization_id: 1, level: 1 });
