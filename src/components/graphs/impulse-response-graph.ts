import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ResponseDetail } from '../../audio/response-detail';
import { GraphConfig } from './line-graph';

type Point = {
  x: number;
  y: number;
};

type Points = Point[];

const MAX_X = 0.5;
const DECIMATION_SAMPLES = 500;

@customElement('impulse-response-graph')
export class ImpulseResponseGraph extends LitElement {
  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

  @property({ type: Array })
  squaredIRPoints: Points[] = [];

  render() {
    const config: GraphConfig = {
      datasets: this.squaredIRPoints.map((points, index) => ({
        label: 'Squared IR',
        data: points,
        fill: false,
        borderColor: this.responseDetails[index].color,
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
      <base-card cardTitle="Squared Impulse Response">
        <line-graph .config=${config} height="100"></line-graph>
      </base-card>
    `;
  }
}
