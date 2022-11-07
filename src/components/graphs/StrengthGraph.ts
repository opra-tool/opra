import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UNIT_DECIBELS, UNIT_HERTZ } from '../../units';
import {
  GRAPH_COLOR_BLUE,
  GRAPH_COLOR_RED,
  GRAPH_COLOR_YELLOW,
} from './colors';
import { getFrequencyLabels } from './common';
import { GraphConfig } from './LineGraph';

@customElement('strength-graph')
export class StrengthGraph extends LitElement {
  @property({ type: Object }) strength: Float64Array = new Float64Array();

  @property({ type: Object }) earlyStrength: Float64Array = new Float64Array();

  @property({ type: Object }) lateStrength: Float64Array = new Float64Array();

  render() {
    const config: GraphConfig = {
      labels: getFrequencyLabels(),
      datasets: [
        {
          label: 'Strength',
          data: this.strength,
          fill: false,
          borderColor: GRAPH_COLOR_BLUE,
        },
        {
          label: 'Early Strength',
          data: this.earlyStrength,
          fill: false,
          borderColor: GRAPH_COLOR_RED,
        },
        {
          label: 'Late Strength',
          data: this.lateStrength,
          fill: false,
          borderColor: GRAPH_COLOR_YELLOW,
        },
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
