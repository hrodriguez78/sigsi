import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-daily-report-detail',
  templateUrl: './daily-report-detail.component.html',
  styleUrls: ['./daily-report-detail.component.scss'],
})
export class DailyReportDetailComponent implements OnInit {
  report: any = null;
  loading = true;

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<any>(`/daily-reports/${id}`).subscribe(r => { this.report = r; this.loading = false; });
    }
  }

  updateStatus(status: string): void {
    this.api.put(`/daily-reports/${this.report.id}`, { status }).subscribe((updated: any) => { this.report = updated; });
  }

  goBack(): void { this.router.navigate(['/daily-reports']); }

  editReport(): void {
    if (this.report) this.router.navigate(['/daily-reports', this.report.id, 'edit']);
  }

  deleteReport(): void {
    if (!this.report || !confirm('¿Está seguro de eliminar este reporte?')) return;
    this.api.delete(`/daily-reports/${this.report.id}`).subscribe(() => this.router.navigate(['/daily-reports']));
  }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = { borrador: 'Borrador', enviado: 'Enviado', revisado: 'Revisado', aprobado: 'Aprobado', rechazado: 'Rechazado' };
    return m[s] || s;
  }
  getTypeLabel(t: string): string {
    const m: Record<string, string> = { bitacora_diaria: 'Bitácora Diaria', reporte_servicio: 'Reporte Servicio', reporte_mantenimiento: 'Reporte Mantenimiento', reporte_calidad: 'Reporte Calidad', reporte_incidente: 'Reporte Incidente', otro: 'Otro' };
    return m[t] || t;
  }
}
