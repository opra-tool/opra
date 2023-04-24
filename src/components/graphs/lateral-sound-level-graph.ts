import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { ImpulseResponse } from '../../analyzing/impulse-response';
import { OctaveBandValues } from '../../analyzing/octave-bands';

@localized()
@customElement('lateral-sound-level-graph')
export class LateralSoundLevelGraph extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array })
  earlyLateralSoundLevels: OctaveBandValues[] = [];

  @property({ type: Array })
  lateLateralSoundLevels: OctaveBandValues[] = [];

  render() {
    const params = [
      {
        key: 'early-lateral-sound-level',
        label: msg('Early Lateral Sound Level'),
        datasets: this.earlyLateralSoundLevels.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values: values.raw(),
        })),
      },
      {
        key: 'late-lateral-sound-level',
        label: msg('Late Lateral Sound Level'),
        datasets: this.lateLateralSoundLevels.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values: values.raw(),
        })),
      },
    ];

    return html`
      <help-card cardTitle=${msg('Lateral Sound Level')}>
        <octave-bands-graph
          .params=${params}
          yAxisLabel="dB"
        ></octave-bands-graph>

        <div slot="help">TODO</div>
      </help-card>
    `;
  }
}
