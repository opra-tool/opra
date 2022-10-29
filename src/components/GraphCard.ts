import { Chart, ChartDataset, ChartTypeRegistry } from 'chart.js';
import { LitElement, html } from 'lit';
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

  protected firstUpdated() {
    const canvas = this.renderRoot.querySelector<HTMLCanvasElement>('#canvas');
    if (canvas === null) {
      throw new Error('canvas required for drawing graph');
    }

    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('canvas 2D context required for drawing graph');
    }

    try {
      // eslint-disable-next-line no-new
      new Chart(ctx, {
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
    } catch (e) {
      // ignore error NS_ERROR_FAILURE due to a bug in firefox
      // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
      if (hasErrorName(e, 'NS_ERROR_FAILURE')) {
        return;
      }

      throw e;
    }
  }

  render() {
    return html`
      <base-card>
        <div>
          <h3>${this.title}</h3>
          <canvas id="canvas" width="400" height="400"></canvas>
        </div>
      </base-card>
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
