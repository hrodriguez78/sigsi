import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SharedModule } from '../../shared/shared.module';
import { AssetsListComponent } from './assets-list/assets-list.component';
import { AssetDetailComponent } from './asset-detail/asset-detail.component';
import { AssetFormComponent } from './asset-form/asset-form.component';

const routes: Routes = [
  { path: '', component: AssetsListComponent },
  { path: 'new', component: AssetFormComponent },
  { path: ':id', component: AssetDetailComponent },
  { path: ':id/edit', component: AssetFormComponent },
];

@NgModule({
  declarations: [
    AssetsListComponent,
    AssetDetailComponent,
    AssetFormComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class AssetsModule {}
