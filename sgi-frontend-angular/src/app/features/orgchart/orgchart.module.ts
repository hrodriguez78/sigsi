import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { OrgchartComponent } from './orgchart.component';
import { OrgNodeComponent } from './org-node.component';

const routes: Routes = [
  { path: '', component: OrgchartComponent },
];

@NgModule({
  declarations: [
    OrgchartComponent,
    OrgNodeComponent,
  ],
  imports: [
    SharedModule,
    FormsModule,
    RouterModule.forChild(routes),
  ],
})
export class OrgchartModule {}
