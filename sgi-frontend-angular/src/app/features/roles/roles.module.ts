import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RolesListComponent } from './roles-list/roles-list.component';
import { RoleFormComponent } from './role-form/role-form.component';

const routes: Routes = [
  { path: '', component: RolesListComponent },
];

@NgModule({
  declarations: [RolesListComponent, RoleFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
  ],
})
export class RolesModule {}
