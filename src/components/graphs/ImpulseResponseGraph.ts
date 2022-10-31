import { ChartOptions } from 'chart.js';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GRAPH_COLOR_BLUE } from './colors';

type Point = {
  x: number;
  y: number;
};

const MAX_X = 0.5;
const DECIMATION_SAMPLES = 500;

@customElement('impulse-response-graph')
export class ImpulseResponseGraph extends LitElement {
  @property({ type: Array }) squaredIR: Point[] = [];

  render() {
    const datasets = [
      {
        label: 'Squared IR',
        data: this.squaredIR,
        fill: false,
        borderColor: GRAPH_COLOR_BLUE,
        borderWidth: 1,
        radius: 0,
      },
    ];

    const options: ChartOptions = {
      indexAxis: 'x',
      scales: {
        y: {
          beginAtZero: true,
        },
        x: {
          type: 'linear',
          max: MAX_X,
          ticks: {
            // Disabled rotation for performance
            maxRotation: 0,
            autoSkip: true,
          },
        },
      },
      parsing: false,
      animation: false,
      plugins: {
        decimation: {
          enabled: true,
          algorithm: 'lttb',
          samples: DECIMATION_SAMPLES,
        },
      },
    };

    return html`
      <graph-card
        title="Impulse Response"
        .datasets=${datasets}
        .options=${options}
        skipParsing
      ></graph-card>
    `;
  }
}
