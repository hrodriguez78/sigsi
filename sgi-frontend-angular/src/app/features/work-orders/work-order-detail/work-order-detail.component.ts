import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-work-order-detail',
  templateUrl: './work-order-detail.component.html',
  styleUrls: ['./work-order-detail.component.scss'],
})
export class WorkOrderDetailComponent implements OnInit {
  workOrder: any = null;
  comments: any[] = [];
  loading = true;
  newComment = '';

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<any>(`/work-orders/${id}`).subscribe(wo => {
        this.workOrder = wo;
        this.loading = false;
        this.loadComments(id);
      });
    }
  }

  loadComments(woId: string): void {
    this.api.get<any[]>(`/work-orders/${woId}/comments`).subscribe(c => this.comments = c);
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.workOrder) return;
    this.api.post(`/work-orders/${this.workOrder.id}/comments`, { text: this.newComment }).subscribe(() => {
      this.newComment = '';
      this.loadComments(this.workOrder.id);
    });
  }

  updateStatus(status: string): void {
    this.api.put(`/work-orders/${this.workOrder.id}`, { status }).subscribe((updated: any) => {
      this.workOrder = updated;
    });
  }

  goBack(): void { this.router.navigate(['/work-orders']); }

  editWorkOrder(): void {
    if (this.workOrder) this.router.navigate(['/work-orders', this.workOrder.id, 'edit']);
  }

  deleteWorkOrder(): void {
    if (!this.workOrder || !confirm('¿Está seguro de eliminar esta orden de trabajo?')) return;
    this.api.delete(`/work-orders/${this.workOrder.id}`).subscribe(() => this.router.navigate(['/work-orders']));
  }

  getStatusLabel(s: string): string {
    const m: Record<string, string> = { pendiente: 'Pendiente', programada: 'Programada', en_progreso: 'En Progreso', en_espera: 'En Espera', completada: 'Completada', cancelada: 'Cancelada', verificada: 'Verificada' };
    return m[s] || s;
  }
  getPriorityLabel(p: string): string {
    const m: Record<string, string> = { critica: 'Crítica', alta: 'Alta', media: 'Media', baja: 'Baja' };
    return m[p] || p;
  }
  getTypeLabel(t: string): string {
    const m: Record<string, string> = { mantenimiento_preventivo: 'Mant. Preventivo', mantenimiento_correctivo: 'Mant. Correctivo', aseo_interior: 'Aseo Interior', aseo_exterior: 'Aseo Exterior', aseo_industrial: 'Aseo Industrial', emergencia: 'Emergencia', instalacion: 'Instalación', otro: 'Otro' };
    return m[t] || t;
  }
}
