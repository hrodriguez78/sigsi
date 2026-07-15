import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { WorkOrdersListComponent } from './work-orders-list/work-orders-list.component';
import { WorkOrderDetailComponent } from './work-order-detail/work-order-detail.component';
import { WorkOrderFormComponent } from './work-order-form/work-order-form.component';

const routes: Routes = [
  { path: '', component: WorkOrdersListComponent },
  { path: 'new', component: WorkOrderFormComponent },
  { path: ':id', component: WorkOrderDetailComponent },
  { path: ':id/edit', component: WorkOrderFormComponent },
];

@NgModule({
  declarations: [WorkOrdersListComponent, WorkOrderDetailComponent, WorkOrderFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class WorkOrdersModule {}
