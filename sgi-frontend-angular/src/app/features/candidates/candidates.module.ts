import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CandidatesListComponent } from './candidates-list/candidates-list.component';
import { CandidateDetailComponent } from './candidate-detail/candidate-detail.component';
import { CandidatePortalComponent } from './candidate-portal/candidate-portal.component';

const routes: Routes = [
  { path: '', component: CandidatesListComponent },
  { path: 'portal', component: CandidatePortalComponent },
  { path: ':id', component: CandidateDetailComponent },
];

@NgModule({
  declarations: [
    CandidatesListComponent,
    CandidateDetailComponent,
    CandidatePortalComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class CandidatesModule {}
