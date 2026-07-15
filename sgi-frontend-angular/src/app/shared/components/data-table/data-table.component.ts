import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableColumn } from '../../../core/models';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent<T extends Record<string, any>> {
  @Input() columns: TableColumn[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'No hay registros';
  @Input() trackBy = 'id';
  @Output() rowClick = new EventEmitter<T>();

  getCellValue(row: T, col: TableColumn): string {
    const value = row[col.key];
    if (col.type === 'date' && value) {
      return new Date(value).toLocaleDateString('es-CO');
    }
    if (col.type === 'badge' && col.badgeMap && value) {
      return col.badgeMap[value]?.label || value;
    }
    return value ?? '';
  }

  getBadgeClass(row: T, col: TableColumn): string {
    if (col.type !== 'badge' || !col.badgeMap) return '';
    const value = row[col.key];
    return col.badgeMap[value]?.class || '';
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  trackByFn(index: number, row: T): any {
    return row[this.trackBy] || index;
  }
}
