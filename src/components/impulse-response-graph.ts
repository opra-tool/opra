import { msg, localized } from '@lit/localize';
import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponse } from '../analyzing/impulse-response';
import { GraphConfig } from './graphs/line-graph';

type Point = {
  x: number;
  y: number;
};

const MAX_X = 0.5;
const DECIMATION_SAMPLES = 500;

@localized()
@customElement('impulse-response-graph')
export class ImpulseResponseGraph extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  squaredIRPoints: Map<
    string,
    {
      color: string;
      points: Point[];
    }
  > = new Map();

  firstUpdated() {
    for (const response of this.impulseResponses) {
      this.updateResponseIR(response);
    }
  }

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.get('impulseResponses') === undefined) {
      return;
    }

    // delete responses no longer present in properties
    for (const [responseId] of this.squaredIRPoints) {
      if (!this.impulseResponses.find(r => r.id === responseId)) {
        this.squaredIRPoints.delete(responseId);
      }
    }

    for (const response of this.impulseResponses) {
      if (
        changedProperties
          .get('impulseResponses')
          .find(r => r.id === response.id)?.buffer !== response.buffer
      ) {
        this.updateResponseIR(response);
      }
    }
  }

  render() {
    const datasets = [];
    for (const [_, { points, color }] of this.squaredIRPoints) {
      datasets.push({
        data: points,
        fill: false,
        borderColor: color,
        borderWidth: 1,
        pointRadius: 0,
      });
    }

    const config: GraphConfig = {
      datasets,
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

  private updateResponseIR({
    id,
    type,
    buffer,
    color,
    sampleRate,
    fileName,
  }: ImpulseResponse) {
    const points = [];

    for (let i = 0; i < buffer.length; i += 1) {
      let y;
      if (type === 'binaural') {
        y =
          (buffer.getChannelData(0)[i] ** 2 +
            buffer.getChannelData(1)[i] ** 2) /
          2;
      } else {
        y = buffer.getChannelData(0)[i] ** 2;
      }

      points.push({
        x: (i + 1) / sampleRate,
        y,
      });
    }

    this.squaredIRPoints.set(id, {
      color,
      points,
    });
  }

  static styles = css`
    h3 {
      margin: 0.5rem 0 2rem 0;
      font-size: 1rem;
      letter-spacing: 1px;
    }
  `;
}
