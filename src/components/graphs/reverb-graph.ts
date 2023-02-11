import { localized, msg } from '@lit/localize';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponse } from '../../analyzing/impulse-response';

type BandValues = number[];

@localized()
@customElement('reverb-graph')
export class ReverbGraph extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array })
  edt: BandValues[] = [];

  @property({ type: Array })
  reverbTime: BandValues[] = [];

  render() {
    const params = [
      {
        key: 'edt',
        label: msg('Energy Decay Curve'),
        datasets: this.edt.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
      {
        key: 'reverbTime',
        label: msg('Reverb Time (T20)'),
        datasets: this.reverbTime.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
    ];

    return html`
      <base-card cardTitle=${msg('Reverberation')}>
        <octave-bands-graph
          .params=${params}
          .yAxisLabel=${msg('Time in seconds')}
        ></octave-bands-graph>
      </base-card>
    `;
  }
}
