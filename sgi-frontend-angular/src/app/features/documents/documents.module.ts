import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { DocumentsListComponent } from './documents-list/documents-list.component';
import { DocumentDetailComponent } from './document-detail/document-detail.component';
import { DocumentFormComponent } from './document-form/document-form.component';
import { OcrExtractorComponent } from './ocr-extractor/ocr-extractor.component';

const routes: Routes = [
  { path: '', component: DocumentsListComponent },
  { path: 'new', component: DocumentFormComponent },
  { path: 'ocr', component: OcrExtractorComponent },
  { path: ':id', component: DocumentDetailComponent },
  { path: ':id/edit', component: DocumentFormComponent },
];

@NgModule({
  declarations: [
    DocumentsListComponent,
    DocumentDetailComponent,
    DocumentFormComponent,
    OcrExtractorComponent,
  ],
  imports: [SharedModule, FormsModule, RouterModule.forChild(routes)],
})
export class DocumentsModule {}
