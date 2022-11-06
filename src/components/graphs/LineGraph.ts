import { Chart, ChartDataset, ChartOptions, Point } from 'chart.js';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type GraphConfig = {
  labels?: string[];
  datasets: ChartDataset<'line', Float64Array | Point[]>[];
  options?: ChartOptions;
};

@customElement('line-graph')
export class LineGraph extends LitElement {
  @property({ type: Object }) config: GraphConfig | undefined;

  protected firstUpdated() {
    const canvas = this.renderRoot.querySelector<HTMLCanvasElement>('#canvas');
    if (canvas === null) {
      throw new Error('canvas required for drawing graph');
    }

    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('canvas 2D context required for drawing graph');
    }

    if (!this.config) {
      throw new Error('expected a graph config to be supplied');
    }

    try {
      // eslint-disable-next-line no-new
      new Chart(ctx, {
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
