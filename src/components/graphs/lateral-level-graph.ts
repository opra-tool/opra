import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UNIT_DECIBELS } from '../../units';
import { ResponseDetail } from '../../audio/response-detail';
import { LateralLevel } from '../../lateral-level';

@customElement('lateral-level-graph')
export class LateralLevelGraph extends LitElement {
  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

  @property({ type: Array })
  lateralLevels: LateralLevel[] = [];

  render() {
    const params = [
      {
        key: 'early-lateral-level',
        label: 'Early Lateral Level',
        datasets: this.lateralLevels.map(
          ({ earlyLateralLevelBands }, index) => ({
            color: this.responseDetails[index].color,
            values: earlyLateralLevelBands,
          })
        ),
      },
      {
        key: 'late-lateral-level',
        label: 'Late Lateral Level',
        datasets: this.lateralLevels.map(
          ({ lateLateralLevelBands }, index) => ({
            color: this.responseDetails[index].color,
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
