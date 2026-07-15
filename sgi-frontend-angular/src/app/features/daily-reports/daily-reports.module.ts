import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { DailyReportsListComponent } from './daily-reports-list/daily-reports-list.component';
import { DailyReportDetailComponent } from './daily-report-detail/daily-report-detail.component';
import { DailyReportFormComponent } from './daily-report-form/daily-report-form.component';

const routes: Routes = [
  { path: '', component: DailyReportsListComponent },
  { path: 'new', component: DailyReportFormComponent },
  { path: ':id', component: DailyReportDetailComponent },
  { path: ':id/edit', component: DailyReportFormComponent },
];

@NgModule({
  declarations: [DailyReportsListComponent, DailyReportDetailComponent, DailyReportFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class DailyReportsModule {}
