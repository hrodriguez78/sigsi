import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { ControlsListComponent } from './controls-list/controls-list.component';
import { ControlDetailComponent } from './control-detail/control-detail.component';
import { ControlFormComponent } from './control-form/control-form.component';
import { SoAComponent } from './soa/soa.component';

const routes: Routes = [
  { path: '', component: ControlsListComponent },
  { path: 'new', component: ControlFormComponent },
  { path: ':id', component: ControlDetailComponent },
  { path: ':id/edit', component: ControlFormComponent },
  { path: 'soa', component: SoAComponent },
];

@NgModule({
  declarations: [
    ControlsListComponent,
    ControlDetailComponent,
    ControlFormComponent,
    SoAComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ControlsModule {}
