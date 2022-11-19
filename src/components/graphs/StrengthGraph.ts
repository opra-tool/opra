import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UNIT_DECIBELS, UNIT_HERTZ } from '../../units';
import { getFrequencyLabels } from './common';
import { GraphConfig } from './LineGraph';
import { DASH_STYLE_DOTTED, DASH_STYLE_DASHED } from './graphStyles';

type MultiValue = {
  color: string;
  values: number[];
};

@customElement('strength-graph')
export class StrengthGraph extends LitElement {
  @property({ type: Array }) strengths: MultiValue[] = [];

  @property({ type: Array }) earlyStrengths: MultiValue[] = [];

  @property({ type: Array }) lateStrengths: MultiValue[] = [];

  render() {
    const config: GraphConfig = {
      labels: getFrequencyLabels(),
      datasets: [
        ...this.strengths.map(({ color, values }) => ({
          label: 'Strength',
          data: values,
          fill: false,
          borderColor: color,
        })),
        ...this.earlyStrengths.map(({ color, values }) => ({
          label: 'Early Strength',
          data: values,
          fill: false,
          borderColor: color,
          borderDash: DASH_STYLE_DASHED,
        })),
        ...this.lateStrengths.map(({ color, values }) => ({
          label: 'Late Strength',
          data: values,
          fill: false,
          borderColor: color,
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
