import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UNIT_HERTZ, UNIT_SECONDS } from '../../units';
import { getFrequencyLabels } from './common';
import { GraphConfig } from './LineGraph';
import { DASH_STYLE_DASHED } from './graphStyles';

type ColoredBandValues = {
  color: string;
  bandValues: number[];
};

@customElement('reverb-graph')
export class ReverbGraph extends LitElement {
  @property({ type: Array }) edt: ColoredBandValues[] = [];

  @property({ type: Array }) reverbTime: ColoredBandValues[] = [];

  render() {
    const config: GraphConfig = {
      labels: getFrequencyLabels(),
      datasets: [
        ...this.edt.map(({ color, bandValues: values }) => ({
          label: 'Energy Decay Curve',
          data: values,
          fill: false,
          borderColor: color,
        })),
        ...this.reverbTime.map(({ color, bandValues: values }) => ({
          label: 'Reverb Time (T20)',
          data: values,
          fill: false,
          borderColor: color,
          borderDash: DASH_STYLE_DASHED,
        })),
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
