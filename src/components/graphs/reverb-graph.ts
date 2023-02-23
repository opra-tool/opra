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
        label: msg('Energy Decay Time'),
        datasets: this.edt.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
      {
        key: 'reverbTime',
        label: html`${msg('Reverb Time')} <i>T<sub>20</sub></i>`,
        datasets: this.reverbTime.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
    ];

    return html`
      <help-card cardTitle=${msg('Reverberation')}>
        <octave-bands-graph
          .params=${params}
          .yAxisLabel=${msg('Time in seconds')}
        ></octave-bands-graph>

        <div slot="help">TODO</div>
      </help-card>
    `;
  }
}
