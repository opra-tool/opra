import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UNIT_HERTZ, UNIT_SECONDS } from '../../units';
import { getFrequencyLabels } from './common';
import { GraphConfig } from './line-graph';
import { DASH_STYLE_DASHED } from './graph-styles';
import { ResponseDetail } from '../../audio/response-detail';

type BandValues = number[];

@customElement('reverb-graph')
export class ReverbGraph extends LitElement {
  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

  @property({ type: Array })
  edt: BandValues[] = [];

  @property({ type: Array })
  reverbTime: BandValues[] = [];

  render() {
    const config: GraphConfig = {
      labels: getFrequencyLabels(),
      datasets: [
        ...this.edt.map((bandValues, index) => ({
          label: 'Energy Decay Curve',
          data: bandValues,
          fill: false,
          borderColor: this.responseDetails[index].color,
        })),
        ...this.reverbTime.map((bandValues, index) => ({
          label: 'Reverb Time (T20)',
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
