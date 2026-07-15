import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.reducer';
import { Subscription } from 'rxjs';
import { selectDashboardTrends } from '../../../store/dashboard/dashboard.selectors';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

@Component({
  selector: 'app-widget-trend-chart',
  template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
      height: 220px;
    }
    canvas { max-height: 220px; }
  `]
})
export class WidgetTrendChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() datasets: string[] = ['risks', 'incidents', 'documents'];

  private chart?: Chart;
  private sub?: Subscription;

  constructor(private store: Store<AppState>) {}

  ngAfterViewInit() {
    this.sub = this.store.select(selectDashboardTrends).subscribe((trends: any) => {
      if (!trends) return;
      this.renderChart(trends);
    });
  }

  private renderChart(trends: any) {
    if (this.chart) this.chart.destroy();
    if (!this.chartCanvas) return;

    const labels = trends?.labels || [];
    const colors: Record<string, string> = {
      risks: '#EF4444',
      incidents: '#F59E0B',
      documents: '#3B82F6',
    };
    const labelsEs: Record<string, string> = {
      risks: 'Riesgos',
      incidents: 'Incidentes',
      documents: 'Documentos',
    };

    const datasets = this.datasets.map((key) => ({
      label: labelsEs[key] || key,
      data: trends?.[key] || [],
      borderColor: colors[key] || '#6B7280',
      backgroundColor: (colors[key] || '#6B7280') + '20',
      tension: 0.4,
      fill: true,
      pointRadius: 3,
    }));

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } } },
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
