import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: 'organizations',
        loadChildren: () =>
          import('./features/organizations/organizations.module').then(
            (m) => m.OrganizationsModule
          ),
      },
      {
        path: 'processes',
        loadChildren: () =>
          import('./features/processes/processes.module').then(
            (m) => m.ProcessesModule
          ),
      },
      {
        path: 'assets',
        loadChildren: () =>
          import('./features/assets/assets.module').then(
            (m) => m.AssetsModule
          ),
      },
      {
        path: 'documents',
        loadChildren: () =>
          import('./features/documents/documents.module').then(
            (m) => m.DocumentsModule
          ),
      },
      {
        path: 'risks',
        loadChildren: () =>
          import('./features/risks/risks.module').then(
            (m) => m.RisksModule
          ),
      },
      {
        path: 'controls',
        loadChildren: () =>
          import('./features/controls/controls.module').then(
            (m) => m.ControlsModule
          ),
      },
      {
        path: 'incidents',
        loadChildren: () =>
          import('./features/incidents/incidents.module').then(
            (m) => m.IncidentsModule
          ),
      },
      {
        path: 'audits',
        loadChildren: () =>
          import('./features/audits/audits.module').then(
            (m) => m.AuditsModule
          ),
      },
      {
        path: 'training',
        loadChildren: () =>
          import('./features/training/training.module').then(
            (m) => m.TrainingModule
          ),
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./features/roles/roles.module').then(
            (m) => m.RolesModule
          ),
      },
      {
        path: 'ai',
        loadChildren: () =>
          import('./features/ai/ai.module').then(
            (m) => m.AIModule
          ),
      },
      {
        path: 'raci',
        loadChildren: () =>
          import('./features/raci/raci.module').then(
            (m) => m.RaciModule
          ),
      },
      {
        path: 'orgchart',
        loadChildren: () =>
          import('./features/orgchart/orgchart.module').then(
            (m) => m.OrgchartModule
          ),
      },
      {
        path: 'candidates',
        loadChildren: () =>
          import('./features/candidates/candidates.module').then(
            (m) => m.CandidatesModule
          ),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.module').then(
            (m) => m.UsersModule
          ),
      },
      {
        path: 'gestion-humana',
        loadChildren: () =>
          import('./features/gestion-humana/gestion-humana.module').then(
            (m) => m.GestionHumanaModule
          ),
      },
      {
        path: 'work-orders',
        loadChildren: () =>
          import('./features/work-orders/work-orders.module').then(
            (m) => m.WorkOrdersModule
          ),
      },
      {
        path: 'daily-reports',
        loadChildren: () =>
          import('./features/daily-reports/daily-reports.module').then(
            (m) => m.DailyReportsModule
          ),
      },
      {
        path: 'inspections',
        loadChildren: () =>
          import('./features/inspections/inspections.module').then(
            (m) => m.InspectionsModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
