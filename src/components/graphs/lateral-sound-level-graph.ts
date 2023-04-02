import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { UNIT_DECIBELS } from '../../presentation/units';
import { ImpulseResponse } from '../../analyzing/impulse-response';

@localized()
@customElement('lateral-sound-level-graph')
export class LateralSoundLevelGraph extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array })
  earlyLateralSoundLevels: number[][] = [];

  @property({ type: Array })
  lateLateralSoundLevels: number[][] = [];

  render() {
    const params = [
      {
        key: 'early-lateral-sound-level',
        label: msg('Early Lateral Sound Level'),
        datasets: this.earlyLateralSoundLevels.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
      {
        key: 'late-lateral-sound-level',
        label: msg('Late Lateral Sound Level'),
        datasets: this.lateLateralSoundLevels.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
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
