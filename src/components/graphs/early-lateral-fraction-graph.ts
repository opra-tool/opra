import { localized, msg } from '@lit/localize';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponse } from '../../analyzing/impulse-response';
import { OctaveBandValues } from '../../analyzing/octave-bands';

@localized()
@customElement('early-lateral-fraction-graph')
export class earlyLateralEnergyFractionGraph extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array }) earlyLateralEnergyFraction: OctaveBandValues[] =
    [];

  render() {
    const params = [
      {
        key: 'earlyLateralEnergyFraction',
        label: msg('Early Lateral Energy Fraction'),
        datasets: this.earlyLateralEnergyFraction.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values: values.raw(),
        })),
      },
    ];

    return html`
      <help-card cardTitle=${msg('Early Lateral Energy Fraction')}>
        <octave-bands-graph .params=${params}></octave-bands-graph>

        <div slot="help">TODO</div>
      </help-card>
    `;
  }
}
