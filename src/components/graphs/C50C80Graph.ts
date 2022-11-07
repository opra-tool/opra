import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GraphConfig } from './LineGraph';
import { GRAPH_COLOR_BLUE, GRAPH_COLOR_RED } from './colors';
import { getFrequencyLabels } from './common';
import { UNIT_DECIBELS, UNIT_HERTZ } from '../../units';

@customElement('c50c80-graph')
export class C50C80Graph extends LitElement {
  @property({ type: Object }) c50: Float64Array = new Float64Array();

  @property({ type: Object }) c80: Float64Array = new Float64Array();

  render() {
    const config: GraphConfig = {
      labels: getFrequencyLabels(),
      datasets: [
        {
          label: 'C50',
          data: this.c50,
          fill: false,
          borderColor: GRAPH_COLOR_RED,
        },
        {
          label: 'C80',
          data: this.c80,
          fill: false,
          borderColor: GRAPH_COLOR_BLUE,
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
      <graph-card title="C50 / C80" .config=${config}></graph-card>
    `;
  }
}
