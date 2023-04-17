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
  strengths: number[][] = [];

  @property({ type: Array })
  earlyStrengths: number[][] = [];

  @property({ type: Array })
  lateStrengths: number[][] = [];

  render() {
    const params = [
      {
        key: 'strength',
        label: msg('Sound Strength'),
        datasets: this.strengths.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
      {
        key: 'earlyStrength',
        label: msg('Early Sound Strength'),
        datasets: this.earlyStrengths.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
      {
        key: 'lateStrength',
        label: msg('Late Sound Strength'),
        datasets: this.lateStrengths.map((values, index) => ({
          color: this.impulseResponses[index].color,
          values,
        })),
      },
    ];

    return html`
      <octave-bands-graph
        .params=${params}
        yAxisLabel="dB"
      ></octave-bands-graph>
    `;
  }
}
