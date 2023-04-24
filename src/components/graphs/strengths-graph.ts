import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { OctaveBandValues } from '../../analyzing/octave-bands';

@localized()
@customElement('strengths-graph')
export class StrengthGraph extends LitElement {
  @property({ type: Array })
  impulseResponses: { color: string }[] = [];

  @property({ type: Array })
  soundStrengths: OctaveBandValues[] = [];

  @property({ type: Array })
  earlySoundStrengths: OctaveBandValues[] = [];

  @property({ type: Array })
  lateSoundStrengths: OctaveBandValues[] = [];

  render() {
    const params = [
      {
        key: 'strength',
        label: msg('Sound Strength'),
        datasets: this.soundStrengths.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values: values.raw(),
        })),
      },
      {
        key: 'earlyStrength',
        label: msg('Early Sound Strength'),
        datasets: this.earlySoundStrengths.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values: values.raw(),
        })),
      },
      {
        key: 'lateStrength',
        label: msg('Late Sound Strength'),
        datasets: this.lateSoundStrengths.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values: values.raw(),
        })),
      },
    ];

    return html`
      <help-card cardTitle=${msg('Sound Strength')}>
        <octave-bands-graph
          .params=${params}
          yAxisLabel="dB"
        ></octave-bands-graph>

        <div slot="help">TODO</div>
      </help-card>
    `;
  }
}
