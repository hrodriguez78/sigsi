import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { GestionHumanaComponent } from './gestion-humana.component';

const routes: Routes = [
  { path: '', component: GestionHumanaComponent },
];

@NgModule({
  declarations: [GestionHumanaComponent],
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
  ],
})
export class GestionHumanaModule {}
