import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { UNIT_DECIBELS } from '../../presentation/units';
import { LateralLevel } from '../../analyzing/lateral-level';
import { ImpulseResponse } from '../../analyzing/impulse-response';

@localized()
@customElement('lateral-level-graph')
export class LateralLevelGraph extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array })
  lateralLevels: LateralLevel[] = [];

  render() {
    const params = [
      {
        key: 'early-lateral-level',
        label: msg('Early Lateral Sound Level'),
        datasets: this.lateralLevels.map(
          ({ earlyLateralLevelBands }, index) => ({
            color: this.impulseResponses[index].color,
            values: earlyLateralLevelBands,
          })
        ),
      },
      {
        key: 'late-lateral-level',
        label: msg('Late Lateral Sound Level'),
        datasets: this.lateralLevels.map(
          ({ lateLateralLevelBands }, index) => ({
            color: this.impulseResponses[index].color,
            values: lateLateralLevelBands,
          })
        ),
      },
    ];

    return html`
      <octave-bands-graph
        .params=${params}
        .yAxisLabel=${UNIT_DECIBELS}
      ></octave-bands-graph>
    `;
  }
}
