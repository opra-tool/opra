import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UNIT_DECIBELS, UNIT_HERTZ } from '../../units';
import { getFrequencyLabels } from './common';
import { GraphConfig } from './line-graph';
import { DASH_STYLE_DOTTED, DASH_STYLE_DASHED } from './graph-styles';
import { Strengths } from '../../strength';
import { ResponseDetail } from '../../audio/response-detail';

@customElement('strengths-graph')
export class StrengthGraph extends LitElement {
  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

  @property({ type: Array })
  strengths: Strengths[] = [];

  render() {
    const config: GraphConfig = {
      labels: getFrequencyLabels(),
      datasets: [
        ...this.strengths.map(({ strength }, index) => ({
          label: 'Strength',
          data: strength,
          fill: false,
          borderColor: this.responseDetails[index].color,
        })),
        ...this.strengths.map(({ earlyStrength }, index) => ({
          label: 'Early Strength',
          data: earlyStrength,
          fill: false,
          borderColor: this.responseDetails[index].color,
          borderDash: DASH_STYLE_DASHED,
        })),
        ...this.strengths.map(({ lateStrength }, index) => ({
          label: 'Late Strength',
          data: lateStrength,
          fill: false,
          borderColor: this.responseDetails[index].color,
          borderDash: DASH_STYLE_DOTTED,
        })),
      ],
      options: {
        scales: {
          y: {
            title: {
              display: true,
              text: UNIT_DECIBELS,
            },
          },
          x: {
            title: {
              display: true,
              text: `Frequency [${UNIT_HERTZ}]`,
            },
          },
        },
      },
    };

    return html`
      <line-graph title="Strengths" .config=${config}></line-graph>
    `;
  }
}
