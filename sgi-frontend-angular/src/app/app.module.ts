import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { reducers } from './store/app.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { OrganizationsEffects } from './store/organizations/organizations.effects';
import { ProcessesEffects } from './store/processes/processes.effects';
import { AssetsEffects } from './store/assets/assets.effects';
import { DocumentsEffects } from './store/documents/documents.effects';
import { RisksEffects } from './store/risks/risks.effects';
import { ControlsEffects } from './store/controls/controls.effects';
import { IncidentsEffects } from './store/incidents/incidents.effects';
import { AuditsEffects } from './store/audits/audits.effects';
import { TrainingEffects } from './store/training/training.effects';
import { RolesEffects } from './store/roles/roles.effects';
import { DashboardEffects } from './store/dashboard/dashboard.effects';
import { AIEffects } from './store/ai/ai.effects';
import { RaciEffects } from './store/raci/raci.effects';
import { WidgetsEffects } from './store/widgets/widgets.effects';
import { OrgChartEffects } from './store/orgchart/orgchart.effects';
import { CandidatesEffects } from './store/candidates/candidates.effects';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([
      AuthEffects,
      OrganizationsEffects,
      ProcessesEffects,
      AssetsEffects,
      DocumentsEffects,
      RisksEffects,
      ControlsEffects,
      IncidentsEffects,
      AuditsEffects,
      TrainingEffects,
      RolesEffects,
      DashboardEffects,
      AIEffects,
      RaciEffects,
      WidgetsEffects,
      OrgChartEffects,
      CandidatesEffects,
    ]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent],
})
export class AppModule {}
