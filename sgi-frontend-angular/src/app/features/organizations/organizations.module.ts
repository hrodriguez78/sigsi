import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { OrganizationsComponent } from './organizations.component';
import { OrganizationFormComponent } from './organization-form/organization-form.component';

const routes: Routes = [
  { path: '', component: OrganizationsComponent },
  { path: 'new', component: OrganizationFormComponent },
  { path: ':id/edit', component: OrganizationFormComponent },
];

@NgModule({
  declarations: [OrganizationsComponent, OrganizationFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class OrganizationsModule {}
