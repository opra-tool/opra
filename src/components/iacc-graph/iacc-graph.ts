import { msg, localized } from '@lit/localize';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponse } from '../../analyzing/impulse-response';
import { OctaveBandValues } from '../../analyzing/octave-bands';

@localized()
@customElement('iacc-graph')
export class IACCGraph extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array }) iacc: OctaveBandValues[] = [];

  @property({ type: Array }) eiacc: OctaveBandValues[] = [];

  render() {
    const params = [
      {
        key: 'iacc',
        label: 'IACC',
        datasets: this.iacc.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values: values.raw(),
        })),
      },
      {
        key: 'eiacc',
        label: msg('Early IACC'),
        datasets: this.eiacc.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values: values.raw(),
        })),
      },
    ];

    return html`
      <help-card cardTitle=${msg('Interaural Cross Correlation')}>
        <octave-bands-graph .params=${params}></octave-bands-graph>
        <iacc-graph-help slot="help"></iacc-graph-help>
      </help-card>
    `;
  }
}
