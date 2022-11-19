import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DASH_STYLE_DASHED } from './graphStyles';
import { GraphConfig } from './LineGraph';
import { getFrequencyLabels } from './common';
import { UNIT_DECIBELS, UNIT_HERTZ } from '../../units';

type ColoredBandValues = {
  color: string;
  bandValues: number[];
};

@customElement('c50c80-graph')
export class C50C80Graph extends LitElement {
  @property({ type: Array }) c50: ColoredBandValues[] = [];

  @property({ type: Array }) c80: ColoredBandValues[] = [];

  render() {
    const config: GraphConfig = {
      labels: getFrequencyLabels(),
      datasets: [
        ...this.c50.map(({ color, bandValues: values }) => ({
          label: 'C50',
          data: values,
          fill: false,
          borderColor: color,
        })),
        ...this.c80.map(({ color, bandValues: values }) => ({
          label: 'C80',
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
