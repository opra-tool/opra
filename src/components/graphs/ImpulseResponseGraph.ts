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

    const options = {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Energy relative to sample rate',
          },
        },
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Time [s]',
          },
          max: MAX_X,
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
