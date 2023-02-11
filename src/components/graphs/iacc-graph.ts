import { msg, localized } from '@lit/localize';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponse } from '../../analyzing/impulse-response';

type BandValues = number[];

@localized()
@customElement('iacc-graph')
export class IACCGraph extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array }) iacc: BandValues[] = [];

  @property({ type: Array }) eiacc: BandValues[] = [];

  render() {
    const params = [
      {
        key: 'iacc',
        label: 'IACC',
        datasets: this.iacc.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
      {
        key: 'eiacc',
        label: msg('Early IACC'),
        datasets: this.eiacc.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
    ];

    return html`
      <base-card cardTitle=${msg('Interaural Cross Correlation')}>
        <octave-bands-graph .params=${params}></octave-bands-graph>
      </base-card>
    `;
  }
}
