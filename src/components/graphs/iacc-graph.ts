import { msg, localized } from '@lit/localize';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ResponseDetail } from '../../audio/response-detail';

type BandValues = number[];

@localized()
@customElement('iacc-graph')
export class IACCGraph extends LitElement {
  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

  @property({ type: Array }) iacc: BandValues[] = [];

  @property({ type: Array }) eiacc: BandValues[] = [];

  render() {
    const params = [
      {
        key: 'iacc',
        label: 'IACC',
        datasets: this.iacc.map((values, index) => ({
          color: this.responseDetails[index].color,
          values,
        })),
      },
      {
        key: 'eiacc',
        label: msg('Early IACC'),
        datasets: this.eiacc.map((values, index) => ({
          color: this.responseDetails[index].color,
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
