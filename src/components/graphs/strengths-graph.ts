import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { ImpulseResponse } from '../../analyzing/impulse-response';

@localized()
@customElement('strengths-graph')
export class StrengthGraph extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array })
  soundStrengths: number[][] = [];

  @property({ type: Array })
  earlySoundStrengths: number[][] = [];

  @property({ type: Array })
  lateSoundStrengths: number[][] = [];

  render() {
    const params = [
      {
        key: 'strength',
        label: msg('Sound Strength'),
        datasets: this.soundStrengths.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
      {
        key: 'earlyStrength',
        label: msg('Early Sound Strength'),
        datasets: this.earlySoundStrengths.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
      {
        key: 'lateStrength',
        label: msg('Late Sound Strength'),
        datasets: this.lateSoundStrengths.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
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
