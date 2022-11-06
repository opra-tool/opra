import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GRAPH_COLOR_BLUE, GRAPH_COLOR_RED } from './colors';
import { getFrequencyLabels } from './common';
import { GraphConfig } from './LineGraph';

@customElement('reverberation-graph')
export class ReverberationGraph extends LitElement {
  @property({ type: Object }) energyDecayCurve: Float64Array =
    new Float64Array();

  @property({ type: Object }) reverberationTime: Float64Array =
    new Float64Array();

  render() {
    const config: GraphConfig = {
      labels: getFrequencyLabels(),
      datasets: [
        {
          label: 'Energy Decay Curve',
          data: this.energyDecayCurve,
          fill: false,
          borderColor: GRAPH_COLOR_RED,
        },
        {
          // TODO: is this T30? 30 is passed into the matlab method when calculations are made
          label: 'Reverb Time (T20)',
          data: this.reverberationTime,
          fill: false,
          borderColor: GRAPH_COLOR_BLUE,
        },
      ],
      options: {
        scales: {
          y: {
            title: {
              display: true,
              text: 'Time [s]',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Frequency [Hz]',
            },
          },
        },
      },
    };

    return html`
      <graph-card title="Reverberation" .config=${config}></graph-card>
    `;
  }
}
