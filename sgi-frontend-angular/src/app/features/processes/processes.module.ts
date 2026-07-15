import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { ProcessesListComponent } from './processes-list/processes-list.component';
import { ProcessDetailComponent } from './process-detail/process-detail.component';
import { ProcessFormComponent } from './process-form/process-form.component';

const routes: Routes = [
  { path: '', component: ProcessesListComponent },
  { path: 'new', component: ProcessFormComponent },
  { path: ':id', component: ProcessDetailComponent },
  { path: ':id/edit', component: ProcessFormComponent },
];

@NgModule({
  declarations: [
    ProcessesListComponent,
    ProcessDetailComponent,
    ProcessFormComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ProcessesModule {}
