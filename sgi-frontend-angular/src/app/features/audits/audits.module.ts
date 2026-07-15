import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SharedModule } from '../../shared/shared.module';
import { AuditsListComponent } from './audits-list/audits-list.component';
import { AuditDetailComponent } from './audit-detail/audit-detail.component';
import { AuditFormComponent } from './audit-form/audit-form.component';

const routes: Routes = [
  {
    path: '',
    component: AuditsListComponent,
  },
  {
    path: 'new',
    component: AuditFormComponent,
  },
  {
    path: ':id',
    component: AuditDetailComponent,
  },
  {
    path: ':id/edit',
    component: AuditFormComponent,
  },
];

@NgModule({
  declarations: [
    AuditsListComponent,
    AuditDetailComponent,
    AuditFormComponent,
  ],
  imports: [
    SharedModule,
    DragDropModule,
    RouterModule.forChild(routes),
  ],
})
export class AuditsModule {}
