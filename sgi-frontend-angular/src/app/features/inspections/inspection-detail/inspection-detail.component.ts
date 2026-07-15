import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-inspection-detail',
  templateUrl: './inspection-detail.component.html',
  styleUrls: ['./inspection-detail.component.scss'],
})
export class InspectionDetailComponent implements OnInit {
  inspection: any = null;
  loading = true;

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<any>(`/inspections/${id}`).subscribe(i => { this.inspection = i; this.loading = false; });
    }
  }

  updateStatus(status: string): void {
    this.api.put(`/inspections/${this.inspection.id}`, { status }).subscribe((updated: any) => { this.inspection = updated; });
  }

  updateChecklistItem(index: number, status: string): void {
    const checklist = [...this.inspection.checklist];
    checklist[index].status = status;
    this.api.put(`/inspections/${this.inspection.id}`, { checklist }).subscribe((updated: any) => { this.inspection = updated; });
  }

  goBack(): void { this.router.navigate(['/inspections']); }

  editInspection(): void {
    if (this.inspection) this.router.navigate(['/inspections', this.inspection.id, 'edit']);
  }

  deleteInspection(): void {
    if (!this.inspection || !confirm('¿Está seguro de eliminar esta inspección?')) return;
    this.api.delete(`/inspections/${this.inspection.id}`).subscribe(() => this.router.navigate(['/inspections']));
  }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = { programada: 'Programada', en_curso: 'En Curso', completada: 'Completada', cancelada: 'Cancelada' };
    return m[s] || s;
  }
  getResultLabel(r: string): string {
    const m: Record<string, string> = { aprobado: 'Aprobado', no_aprobado: 'No Aprobado', parcial: 'Parcial', pendiente: 'Pendiente' };
    return m[r] || r;
  }
  getTypeLabel(t: string): string {
    const m: Record<string, string> = { calidad: 'Calidad', seguridad: 'Seguridad', ambiental: 'Ambiental', operacional: 'Operacional', cumplimiento: 'Cumplimiento', seguridad_industrial: 'Seg. Industrial', otro: 'Otro' };
    return m[t] || t;
  }
  getCheckItemStatusIcon(s: string): string {
    const m: Record<string, string> = { cumple: 'check_circle', no_cumple: 'cancel', no_aplicable: 'remove_circle', pendiente: 'radio_button_unchecked' };
    return m[s] || 'radio_button_unchecked';
  }
  getCheckItemStatusClass(s: string): string {
    const m: Record<string, string> = { cumple: 'text-success', no_cumple: 'text-danger', no_aplicable: 'text-muted', pendiente: 'text-warning' };
    return m[s] || '';
  }
}
