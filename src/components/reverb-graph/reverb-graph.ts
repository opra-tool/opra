import { localized, msg } from '@lit/localize';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponse } from '../../analyzing/impulse-response';
import { OctaveBandValues } from '../../analyzing/octave-bands';

@localized()
@customElement('reverb-graph')
export class ReverbGraph extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array })
  edt: OctaveBandValues[] = [];

  @property({ type: Array })
  reverbTime: OctaveBandValues[] = [];

  render() {
    const params = [
      {
        key: 'edt',
        label: msg('Early Decay Time'),
        datasets: this.edt.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values: values.raw(),
        })),
      },
      {
        key: 'reverbTime',
        label: html`${msg('Reverb Time')} <i>T<sub>20</sub></i>`,
        datasets: this.reverbTime.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values: values.raw(),
        })),
      },
    ];

    return html`
      <help-card cardTitle=${msg('Reverberation')}>
        <octave-bands-graph
          .params=${params}
          .yAxisLabel=${msg('Time in seconds')}
        ></octave-bands-graph>

        <reverb-graph-help slot="help"></reverb-graph-help>
      </help-card>
    `;
  }
}
