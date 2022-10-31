import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GRAPH_COLOR_BLUE, GRAPH_COLOR_RED } from './colors';
import { getFrequencyLabels } from './common';

@customElement('c50c80-graph')
export class C50C80Graph extends LitElement {
  @property({ type: Object }) c50: Float64Array = new Float64Array();

  @property({ type: Object }) c80: Float64Array = new Float64Array();

  render() {
    const datasets = [
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
    ];

    const options = {
      scales: {
        y: {
          title: {
            display: true,
            text: 'dB',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Frequency [Hz]',
          },
        },
      },
    };

    return html`
      <graph-card
        title="C50 / C80"
        .labels=${getFrequencyLabels()}
        .datasets=${datasets}
        .options=${options}
      ></graph-card>
    `;
  }
}
