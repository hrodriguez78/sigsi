import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { DashboardComponent } from './dashboard.component';
import { WidgetWrapperComponent } from './widgets/widget-wrapper.component';
import { WidgetStatCardComponent } from './widgets/widget-stat-card.component';
import { WidgetKpiCardComponent } from './widgets/widget-kpi-card.component';
import { WidgetRiskChartComponent } from './widgets/widget-risk-chart.component';
import { WidgetTrendChartComponent } from './widgets/widget-trend-chart.component';
import { WidgetComplianceChartComponent } from './widgets/widget-compliance-chart.component';
import { WidgetIncidentSummaryComponent } from './widgets/widget-incident-summary.component';
import { WidgetSettingsComponent } from './widgets/widget-settings.component';

const routes: Routes = [{ path: '', component: DashboardComponent }];

@NgModule({
  declarations: [
    DashboardComponent,
    WidgetWrapperComponent,
    WidgetStatCardComponent,
    WidgetKpiCardComponent,
    WidgetRiskChartComponent,
    WidgetTrendChartComponent,
    WidgetComplianceChartComponent,
    WidgetIncidentSummaryComponent,
    WidgetSettingsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DragDropModule,
  ],
})
export class DashboardModule {}
