import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(
    private api: ApiService,
    private toast: ToastService,
  ) {}

  exportModule(module: string, organizationId?: string, format: 'xlsx' | 'pdf' = 'xlsx'): void {
    let url = `/export/${module}?format=${format}`;
    if (organizationId) {
      url += `&organization_id=${organizationId}`;
    }

    this.toast.show('info', `Generando exportación ${format.toUpperCase()}...`);

    this.api.getBlob(url).subscribe({
      next: (blob) => {
        const ext = format === 'pdf' ? 'pdf' : 'xlsx';
        const fileName = `${module}_${new Date().toISOString().slice(0, 10)}.${ext}`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.show('success', 'Exportación descargada correctamente');
      },
      error: () => {
        this.toast.show('error', 'Error al generar la exportación');
      },
    });
  }
}
