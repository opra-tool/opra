import { msg, localized } from '@lit/localize';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponse } from '../analyzing/impulse-response';
import { GraphConfig } from './graphs/line-graph';

type Point = {
  x: number;
  y: number;
};

type Points = Point[];

const MAX_X = 0.5;
const DECIMATION_SAMPLES = 500;

@localized()
@customElement('impulse-response-graph')
export class ImpulseResponseGraph extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array })
  squaredIRPoints: Points[] = [];

  render() {
    const config: GraphConfig = {
      datasets: this.squaredIRPoints.map((points, index) => ({
        data: points,
        fill: false,
        borderColor: this.impulseResponses[index].color,
        borderWidth: 1,
        pointRadius: 0,
      })),
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: msg('Energy relative to sample rate'),
            },
          },
          x: {
            type: 'linear',
            title: {
              display: true,
              text: msg('Time (seconds)'),
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

    // This component does not use the <titled-card> component,
    // as this seems to trigger a bug in Firefox (https://bugzilla.mozilla.org/show_bug.cgi?id=941146).
    // It is not entirely clear why this error occurs with this component
    // and not other graphs. Possibly caused by a certain nesting of web components.
    return html`
      <base-card>
        <h3>${msg('Squared Impulse Response')}</h3>
        <line-graph .config=${config} height="100"></line-graph>
      </base-card>
    `;
  }

  static styles = css`
    h3 {
      margin: 0.5rem 0 2rem 0;
      font-size: 1rem;
      letter-spacing: 1px;
    }
  `;
}
