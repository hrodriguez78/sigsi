import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DataTableComponent } from './components/data-table/data-table.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { LayoutComponent } from './components/layout/layout.component';
import { SearchComponent } from './components/search/search.component';
import { HasRoleDirective } from './directives/has-role.directive';
import { TooltipDirective } from './directives/tooltip.directive';
import { TruncatePipe } from './pipes/truncate.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { MarkdownPipe } from './pipes/markdown.pipe';

const COMPONENTS = [
  DataTableComponent,
  ConfirmDialogComponent,
  PageHeaderComponent,
  LoadingSpinnerComponent,
  ToastContainerComponent,
  PaginationComponent,
  LayoutComponent,
  SearchComponent,
];

const DIRECTIVES = [HasRoleDirective, TooltipDirective];
const PIPES = [TruncatePipe, TimeAgoPipe, MarkdownPipe];

@NgModule({
  declarations: [...COMPONENTS, ...DIRECTIVES, ...PIPES],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  exports: [
    ...COMPONENTS,
    ...DIRECTIVES,
    ...PIPES,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule {}
