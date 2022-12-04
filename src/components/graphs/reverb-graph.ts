import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ResponseDetail } from '../../audio/response-detail';
import { UNIT_SECONDS } from '../../units';

type BandValues = number[];

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
        label: 'Energy Decay Curve',
        datasets: this.edt.map((values, index) => ({
          color: this.responseDetails[index].color,
          values,
        })),
      },
      {
        key: 'reverbTime',
        label: 'Reverb Time (T20)',
        datasets: this.reverbTime.map((values, index) => ({
          color: this.responseDetails[index].color,
          values,
        })),
      },
    ];

    return html`
      <base-card cardTitle="Reverberation">
        <octave-bands-graph
          .params=${params}
          .yAxisLabel=${`Time [${UNIT_SECONDS}]`}
        ></octave-bands-graph>
      </base-card>
    `;
  }
}
