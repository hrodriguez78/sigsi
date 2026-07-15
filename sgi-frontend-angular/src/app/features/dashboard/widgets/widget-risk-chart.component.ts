import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.reducer';
import { Subscription } from 'rxjs';
import { selectDashboardKPIs } from '../../../store/dashboard/dashboard.selectors';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-widget-risk-chart',
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
      display: flex;
      align-items: center;
      justify-content: center;
    }
    canvas { max-height: 200px; }
  `]
})
export class WidgetRiskChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() chartType = 'doughnut';

  private chart?: Chart;
  private sub?: Subscription;

  constructor(private store: Store<AppState>) {}

  ngAfterViewInit() {
    this.sub = this.store.select(selectDashboardKPIs).subscribe((kpis: any) => {
      if (!kpis) return;
      const data = kpis?.risk_distribution || [0, 0, 0, 0];
      this.renderChart(data);
    });
  }

  private renderChart(data: number[]) {
    if (this.chart) this.chart.destroy();
    if (!this.chartCanvas) return;

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: this.chartType as any,
      data: {
        labels: ['Bajo', 'Medio', 'Alto', 'Crítico'],
        datasets: [{
          data,
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#7C3AED'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8, font: { size: 11 } } }
        }
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.chart?.destroy();
  }
}
