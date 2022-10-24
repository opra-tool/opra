import { Chart, ChartDataset, ChartTypeRegistry } from 'chart.js';
import { LitElement, html, css } from 'lit';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { property } from 'lit/decorators.js';

export class GraphCard extends LitElement {
  // TODO: how to deal with required properties without initialization?
  @property({ type: String }) title: string = 'no title defined';

  // TODO: validate if valid chart type or hardcode type
  @property({ type: String }) type: keyof ChartTypeRegistry = 'line';

  @property({ type: Array, attribute: false }) labels: string[] = [];

  @property({ type: Array, attribute: false }) datasets: ChartDataset<
    'line',
    Float64Array
  >[] = [];

  private chart: Chart<keyof ChartTypeRegistry, Float64Array, string> | null =
    null;

  protected firstUpdated() {
    const canvas = this.renderRoot.querySelector<HTMLCanvasElement>('#canvas');
    if (canvas === null) {
      throw new Error('canvas required for drawing graph');
    }

    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('canvas 2D context required for drawing graph');
    }

    this.chart = new Chart(ctx, {
      type: this.type,
      data: {
        labels: this.labels,
        datasets: this.datasets,
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  render() {
    return html`
      <div class="graph-card">
        <h3>${this.title}</h3>
        <canvas id="canvas" width="400" height="400"></canvas>
      </div>
    `;
  }

  static styles = css`
    .graph-card {
      padding: 1rem;
      box-shadow: 0 12px 17px 2px rgb(0 0 0 / 14%),
        0 5px 22px 4px rgb(0 0 0 / 12%), 0 7px 8px -4px rgb(0 0 0 / 20%);
      border-radius: 0.5rem;
    }
  `;
}
