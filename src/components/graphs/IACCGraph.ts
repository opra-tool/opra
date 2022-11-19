import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UNIT_HERTZ } from '../../units';
import { getFrequencyLabels } from './common';
import { GraphConfig } from './LineGraph';
import { DASH_STYLE_DASHED } from './graphStyles';

type ColoredBandValues = {
  color: string;
  bandValues: number[];
};

@customElement('iacc-graph')
export class IACCGraph extends LitElement {
  @property({ type: Array }) iacc: ColoredBandValues[] = [];

  @property({ type: Array }) eiacc: ColoredBandValues[] = [];

  render() {
    const config: GraphConfig = {
      labels: getFrequencyLabels(),
      datasets: [
        ...this.iacc.map(({ color, bandValues: values }) => ({
          label: 'Interaural Cross Correlation',
          data: values,
          fill: false,
          borderColor: color,
        })),
        ...this.eiacc.map(({ color, bandValues: values }) => ({
          label: 'Early Interaural Cross Correlation',
          data: values,
          fill: false,
          borderColor: color,
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
