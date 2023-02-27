import {
  Chart,
  ChartDataset,
  ChartOptions,
  ChartTypeRegistry,
  Point,
} from 'chart.js';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

export type GraphConfig = {
  labels?: string[];
  datasets: ChartDataset<'line', number[] | Point[]>[];
  options?: ChartOptions;
};

@customElement('line-graph')
export class LineGraph extends LitElement {
  private chart: Chart<
    keyof ChartTypeRegistry,
    number[] | Point[],
    string
  > | null = null;

  @property({ type: Object }) config: GraphConfig | undefined;

  @property({ type: String }) width: string = '400';

  @property({ type: String }) height: string = '250';

  @query('#canvas')
  private canvas!: HTMLCanvasElement;

  protected firstUpdated() {
    if (!this.config) {
      throw new Error('expected a graph config to be supplied');
    }

    const ctx = this.canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('canvas 2D context required for drawing graph');
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.config.labels || ['lala', 'lulu'],
        datasets: this.config.datasets,
      },
      options: this.config.options,
    });
  }

  protected updated(): void {
    if (!this.config) {
      throw new Error('expected a graph config to be supplied');
    }

    if (this.chart) {
      this.chart.data = {
        labels: this.config.labels,
        datasets: this.config.datasets,
      };
      if (this.config.options) {
        this.chart.options = this.config.options;
      }
      this.chart.update();
    } else {
      throw new Error('expected chart to be defined');
    }
  }

  render() {
    return html`
      <!-- wrapping div is needed for proper rendering of chart -->
      <div>
        <canvas id="canvas" width=${this.width} height=${this.height}></canvas>
      </div>
    `;
  }
}
