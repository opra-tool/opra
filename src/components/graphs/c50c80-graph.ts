import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponse } from '../../analyzing/impulse-response';
import { UNIT_DECIBELS } from '../../presentation/units';

type BandValues = number[];

@customElement('c50c80-graph')
export class C50C80Graph extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array }) c50: BandValues[] = [];

  @property({ type: Array }) c80: BandValues[] = [];

  render() {
    const params = [
      {
        key: 'c50',
        label: 'C50',
        datasets: this.c50.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
      {
        key: 'c80',
        label: 'C80',
        datasets: this.c80.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
    ];

    return html`
      <help-card cardTitle="C50 / C80">
        <octave-bands-graph
          .params=${params}
          .yAxisLabel=${UNIT_DECIBELS}
        ></octave-bands-graph>

        <div slot="help">TODO</div>
      </help-card>
    `;
  }
}
