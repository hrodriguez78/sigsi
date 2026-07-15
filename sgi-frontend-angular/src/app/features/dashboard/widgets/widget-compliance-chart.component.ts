import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.reducer';
import { Subscription } from 'rxjs';
import { selectDashboardStats } from '../../../store/dashboard/dashboard.selectors';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

@Component({
  selector: 'app-widget-compliance-chart',
  template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
      height: 200px;
    }
    canvas { max-height: 200px; }
  `]
})
export class WidgetComplianceChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private sub?: Subscription;

  constructor(private store: Store<AppState>) {}

  ngAfterViewInit() {
    this.sub = this.store.select(selectDashboardStats).subscribe((stats: any) => {
      if (!stats) return;
      const controlStats = stats?.controls || {};
      this.renderChart([
        controlStats.implemented || 0,
        controlStats.effective || 0,
        (controlStats.total || 0) - (controlStats.implemented || 0) - (controlStats.effective || 0)
      ]);
    });
  }

  private renderChart(data: number[]) {
    if (this.chart) this.chart.destroy();
    if (!this.chartCanvas) return;

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Implementados', 'Efectivos', 'Pendientes'],
        datasets: [{
          data,
          backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'var(--border-color)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.chart?.destroy();
  }
}
