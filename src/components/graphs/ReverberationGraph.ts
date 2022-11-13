import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UNIT_HERTZ, UNIT_SECONDS } from '../../units';
import { GRAPH_COLOR_BLUE, GRAPH_COLOR_RED } from './colors';
import { getFrequencyLabels } from './common';
import { GraphConfig } from './LineGraph';

@customElement('reverberation-graph')
export class ReverberationGraph extends LitElement {
  @property({ type: Array }) energyDecayCurve: number[] = [];

  @property({ type: Array }) reverberationTime: number[] = [];

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
              text: `Time [${UNIT_SECONDS}]`,
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
      <graph-card title="Reverberation" .config=${config}></graph-card>
    `;
  }
}
