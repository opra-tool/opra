import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { OctaveBandValues } from '../../analyzing/octave-bands';

@customElement('c50c80-graph')
export class C50C80Graph extends LitElement {
  @property({ type: Array })
  impulseResponses: { color: string }[] = [];

  @property({ type: Array }) c50: OctaveBandValues[] = [];

  @property({ type: Array }) c80: OctaveBandValues[] = [];

  render() {
    const params = [
      {
        key: 'c50',
        label: 'C50',
        datasets: this.c50.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values: values.raw(),
        })),
      },
      {
        key: 'c80',
        label: 'C80',
        datasets: this.c80.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values: values.raw(),
        })),
      },
    ];

    return html`
      <help-card cardTitle="C50 / C80">
        <octave-bands-graph
          .params=${params}
          yAxisLabel="dB"
        ></octave-bands-graph>
        <c50c80-graph-help slot="help"></c50c80-graph-help>
      </help-card>
    `;
  }
}
