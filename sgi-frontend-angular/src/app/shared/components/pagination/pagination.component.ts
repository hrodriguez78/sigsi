import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    <div class="pagination" *ngIf="totalPages > 1">
      <button
        class="pagination__btn"
        [disabled]="currentPage === 1"
        (click)="pageChange.emit(currentPage - 1)"
      >
        <span class="material-icons">chevron_left</span>
      </button>

      <button
        *ngFor="let p of visiblePages"
        class="pagination__btn"
        [class.active]="p === currentPage"
        (click)="pageChange.emit(p)"
      >
        {{ p }}
      </button>

      <button
        class="pagination__btn"
        [disabled]="currentPage === totalPages"
        (click)="pageChange.emit(currentPage + 1)"
      >
        <span class="material-icons">chevron_right</span>
      </button>

      <span class="pagination__info">
        Página {{ currentPage }} de {{ totalPages }} ({{ totalItems }} registros)
      </span>
    </div>
  `,
  styles: [
    `
      .pagination {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 16px;
      }
      .pagination__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
        height: 36px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: #fff;
        color: #475569;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.15s;
      }
      .pagination__btn:hover:not(:disabled):not(.active) {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
      .pagination__btn.active {
        background: #3b82f6;
        color: #fff;
        border-color: #3b82f6;
      }
      .pagination__btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .pagination__info {
        margin-left: 12px;
        font-size: 0.8125rem;
        color: #64748b;
      }
    `,
  ],
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 20;
  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
