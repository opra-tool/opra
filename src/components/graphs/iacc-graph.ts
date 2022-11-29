import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UNIT_HERTZ } from '../../units';
import { getFrequencyLabels } from './common';
import { GraphConfig } from './line-graph';
import { DASH_STYLE_DASHED } from './graph-styles';
import { ResponseDetail } from '../../audio/response-detail';

type BandValues = number[];

@customElement('iacc-graph')
export class IACCGraph extends LitElement {
  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

  @property({ type: Array }) iacc: BandValues[] = [];

  @property({ type: Array }) eiacc: BandValues[] = [];

  render() {
    const config: GraphConfig = {
      labels: getFrequencyLabels(),
      datasets: [
        ...this.iacc.map((values, index) => ({
          label: 'Interaural Cross Correlation',
          data: values,
          fill: false,
          borderColor: this.responseDetails[index].color,
        })),
        ...this.eiacc.map((values, index) => ({
          label: 'Early Interaural Cross Correlation',
          data: values,
          fill: false,
          borderColor: this.responseDetails[index].color,
          borderDash: DASH_STYLE_DASHED,
        })),
      ],
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: `Frequency (${UNIT_HERTZ})`,
            },
          },
        },
      },
    };

    return html`
      <graph-card
        title="Interaural Cross Correlation"
        .config=${config}
        height="150"
      ></graph-card>
    `;
  }
}
