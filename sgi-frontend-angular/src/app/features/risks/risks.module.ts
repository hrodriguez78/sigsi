import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { RisksListComponent } from './risks-list/risks-list.component';
import { RiskDetailComponent } from './risk-detail/risk-detail.component';
import { RiskFormComponent } from './risk-form/risk-form.component';
import { RiskMatrixComponent } from './risk-matrix/risk-matrix.component';

const routes: Routes = [
  { path: '', component: RisksListComponent },
  { path: 'new', component: RiskFormComponent },
  { path: 'matrix', component: RiskMatrixComponent },
  { path: ':id', component: RiskDetailComponent },
  { path: ':id/edit', component: RiskFormComponent },
];

@NgModule({
  declarations: [
    RisksListComponent,
    RiskDetailComponent,
    RiskFormComponent,
    RiskMatrixComponent,
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class RisksModule {}
