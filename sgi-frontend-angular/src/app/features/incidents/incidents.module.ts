import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { IncidentsListComponent } from './incidents-list/incidents-list.component';
import { IncidentDetailComponent } from './incident-detail/incident-detail.component';
import { IncidentFormComponent } from './incident-form/incident-form.component';

const routes: Routes = [
  {
    path: '',
    component: IncidentsListComponent,
  },
  {
    path: 'new',
    component: IncidentFormComponent,
  },
  {
    path: ':id',
    component: IncidentDetailComponent,
  },
  {
    path: ':id/edit',
    component: IncidentFormComponent,
  },
];

@NgModule({
  declarations: [
    IncidentsListComponent,
    IncidentDetailComponent,
    IncidentFormComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class IncidentsModule {}
