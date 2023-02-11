import { localized, msg } from '@lit/localize';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ResponseDetail } from '../../audio/response-detail';

type BandValues = number[];

@localized()
@customElement('reverb-graph')
export class ReverbGraph extends LitElement {
  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

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
          color: this.responseDetails[index].color,
          values,
        })),
      },
      {
        key: 'reverbTime',
        label: msg('Reverb Time (T20)'),
        datasets: this.reverbTime.map((values, index) => ({
          color: this.responseDetails[index].color,
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
