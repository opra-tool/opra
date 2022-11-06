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
  datasets: ChartDataset<'line', Float64Array | Point[]>[];
  options?: ChartOptions;
};

@customElement('line-graph')
export class LineGraph extends LitElement {
  private chart: Chart<
    keyof ChartTypeRegistry,
    Float64Array | Point[],
    string
  > | null = null;

  @property({ type: Object }) config: GraphConfig | undefined;

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

    try {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.config.labels,
          datasets: this.config.datasets,
        },
        options: this.config.options,
      });
    } catch (e) {
      // ignore error NS_ERROR_FAILURE due to a bug in firefox
      // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
      if (hasErrorName(e, 'NS_ERROR_FAILURE')) {
        return;
      }

      throw e;
    }
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
    }
  }

  render() {
    return html`
      <!-- wrapping div is needed for proper rendering of chart -->
      <div>
        <canvas id="canvas" width="400" height="250"></canvas>
      </div>
    `;
  }
}

function hasErrorName(e: unknown, name: string): boolean {
  if (!e) {
    return false;
  }

  if (typeof e !== 'object') {
    return false;
  }

  return (e as { name: string }).name === name;
}
