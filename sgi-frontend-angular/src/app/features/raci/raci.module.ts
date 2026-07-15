import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { SharedModule } from '../../shared/shared.module';
import { RaciListComponent } from './raci-list/raci-list.component';
import { RaciMatrixComponent } from './raci-matrix/raci-matrix.component';
import { RaciFormComponent } from './raci-form/raci-form.component';

const routes: Routes = [
  { path: '', component: RaciListComponent },
  { path: 'new', component: RaciFormComponent },
  { path: ':id', component: RaciMatrixComponent },
  { path: ':id/edit', component: RaciFormComponent },
];

@NgModule({
  declarations: [
    RaciListComponent,
    RaciMatrixComponent,
    RaciFormComponent,
  ],
  imports: [SharedModule, DragDropModule, RouterModule.forChild(routes)],
})
export class RaciModule {}
