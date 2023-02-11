import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { UNIT_DECIBELS } from '../../units';
import { Strengths } from '../../strength';
import { ResponseDetail } from '../../audio/response-detail';

@localized()
@customElement('strengths-graph')
export class StrengthGraph extends LitElement {
  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

  @property({ type: Array })
  strengths: Strengths[] = [];

  render() {
    const params = [
      {
        key: 'strength',
        label: msg('Sound Strength'),
        datasets: this.strengths.map(({ strength }, index) => ({
          color: this.responseDetails[index].color,
          values: strength,
        })),
      },
      {
        key: 'earlyStrength',
        label: msg('Early Sound Strength'),
        datasets: this.strengths.map(({ earlyStrength }, index) => ({
          color: this.responseDetails[index].color,
          values: earlyStrength,
        })),
      },
      {
        key: 'lateStrength',
        label: msg('Late Sound Strength'),
        datasets: this.strengths.map(({ lateStrength }, index) => ({
          color: this.responseDetails[index].color,
          values: lateStrength,
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
