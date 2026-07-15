import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { InspectionsListComponent } from './inspections-list/inspections-list.component';
import { InspectionDetailComponent } from './inspection-detail/inspection-detail.component';
import { InspectionFormComponent } from './inspection-form/inspection-form.component';

const routes: Routes = [
  { path: '', component: InspectionsListComponent },
  { path: 'new', component: InspectionFormComponent },
  { path: ':id', component: InspectionDetailComponent },
  { path: ':id/edit', component: InspectionFormComponent },
];

@NgModule({
  declarations: [InspectionsListComponent, InspectionDetailComponent, InspectionFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class InspectionsModule {}
