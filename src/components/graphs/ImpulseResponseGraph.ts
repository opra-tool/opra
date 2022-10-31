import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GRAPH_COLOR_BLUE } from './colors';

type Point = {
  x: number;
  y: number;
};

@customElement('impulse-response-graph')
export class ImpulseResponseGraph extends LitElement {
  @property({ type: Array }) squaredIR: Point[] = [];

  render() {
    // TODO: use points directly instead of labels
    const labels = this.squaredIR.map(v => v.x.toFixed(2));
    const datasets = [
      {
        label: 'Squared IR',
        data: new Float64Array(this.squaredIR.map(v => v.y)),
        fill: false,
        borderColor: GRAPH_COLOR_BLUE,
        borderWidth: 1,
      },
    ];

    return html`
      <graph-card
        title="Impulse Response"
        .labels=${labels}
        .datasets=${datasets}
      ></graph-card>
    `;
  }
}
