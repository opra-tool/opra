import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { DASH_STYLE_DASHED } from './graph-styles';
import { GraphConfig } from './line-graph';
import { getFrequencyLabels } from './common';
import { UNIT_DECIBELS, UNIT_HERTZ } from '../../units';
import { ResponseDetail } from '../../audio/response-detail';

type BandValues = number[];

@customElement('c50c80-graph')
export class C50C80Graph extends LitElement {
  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

  @property({ type: Array }) c50: BandValues[] = [];

  @property({ type: Array }) c80: BandValues[] = [];

  render() {
    const config: GraphConfig = {
      labels: getFrequencyLabels(),
      datasets: [
        ...this.c50.map((bandValues, index) => ({
          label: 'C50',
          data: bandValues,
          fill: false,
          borderColor: this.responseDetails[index].color,
        })),
        ...this.c80.map((bandValues, index) => ({
          label: 'C80',
          data: bandValues,
          fill: false,
          borderColor: this.responseDetails[index].color,
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
