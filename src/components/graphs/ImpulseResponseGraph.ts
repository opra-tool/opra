import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GraphConfig } from './LineGraph';

type Point = {
  x: number;
  y: number;
};

type ColoredPoints = {
  color: string;
  points: Point[];
};

const MAX_X = 0.5;
const DECIMATION_SAMPLES = 500;

@customElement('impulse-response-graph')
export class ImpulseResponseGraph extends LitElement {
  @property({ type: Array }) squaredIR: ColoredPoints[] = [];

  render() {
    const config: GraphConfig = {
      datasets: this.squaredIR.map(({ color, points }) => ({
        label: 'Squared IR',
        data: points,
        fill: false,
        borderColor: color,
        borderWidth: 1,
        pointRadius: 0,
      })),
      options: {
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
      },
    };

    return html`
      <graph-card
        title="Impulse Response"
        .config=${config}
        height="100"
      ></graph-card>
    `;
  }
}
