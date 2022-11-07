import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UNIT_HERTZ } from '../../units';
import { GRAPH_COLOR_BLUE, GRAPH_COLOR_RED } from './colors';
import { getFrequencyLabels } from './common';
import { GraphConfig } from './LineGraph';

@customElement('iacc-graph')
export class IACCGraph extends LitElement {
  @property({ type: Object }) iacc: Float64Array = new Float64Array();

  @property({ type: Object }) eiacc: Float64Array = new Float64Array();

  render() {
    const config: GraphConfig = {
      labels: getFrequencyLabels(),
      datasets: [
        {
          label: 'Interaural Cross Correlation',
          data: this.iacc,
          fill: false,
          borderColor: GRAPH_COLOR_BLUE,
        },
        {
          label: 'Early Interaural Cross Correlation',
          data: this.eiacc,
          fill: false,
          borderColor: GRAPH_COLOR_RED,
        },
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
      ></graph-card>
    `;
  }
}
