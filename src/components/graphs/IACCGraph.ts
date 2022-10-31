import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GRAPH_COLOR_BLUE, GRAPH_COLOR_RED } from './colors';
import { getFrequencyLabels } from './common';

@customElement('iacc-graph')
export class IACCGraph extends LitElement {
  @property({ type: Object }) iacc: Float64Array = new Float64Array();

  @property({ type: Object }) eiacc: Float64Array = new Float64Array();

  render() {
    const datasets = [
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
    ];

    return html`
      <graph-card
        title="Interaural Cross Correlation"
        .labels=${getFrequencyLabels()}
        .datasets=${datasets}
      ></graph-card>
    `;
  }
}
