import { localized, msg } from '@lit/localize';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ResponseDetail } from '../../audio/response-detail';
import { UNIT_DECIBELS } from '../../units';

type BandValues = number[];

@localized()
@customElement('early-lateral-fraction-graph')
export class earlyLateralEnergyFractionGraph extends LitElement {
  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

  @property({ type: Array }) earlyLateralEnergyFraction: BandValues[] = [];

  render() {
    const params = [
      {
        key: 'earlyLateralEnergyFraction',
        label: msg('Early Lateral Energy Fraction'),
        datasets: this.earlyLateralEnergyFraction.map((values, index) => ({
          color: this.responseDetails[index].color,
          values,
        })),
      },
    ];

    return html`
      <base-card cardTitle=${msg('Early Lateral Energy Fraction')}>
        <octave-bands-graph
          .params=${params}
          .yAxisLabel=${UNIT_DECIBELS}
        ></octave-bands-graph>
      </base-card>
    `;
  }
}
