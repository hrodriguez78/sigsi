import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TrainingListComponent } from './training-list/training-list.component';
import { TrainingDetailComponent } from './training-detail/training-detail.component';
import { TrainingFormComponent } from './training-form/training-form.component';

const routes: Routes = [
  { path: '', component: TrainingListComponent },
  { path: 'new', component: TrainingFormComponent },
  { path: ':id', component: TrainingDetailComponent },
  { path: ':id/edit', component: TrainingFormComponent },
];

@NgModule({
  declarations: [
    TrainingListComponent,
    TrainingDetailComponent,
    TrainingFormComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class TrainingModule {}
