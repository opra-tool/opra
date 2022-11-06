import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { GraphConfig } from './graphs/LineGraph';

@customElement('graph-card')
export class GraphCard extends LitElement {
  // TODO: how to deal with required properties without initialization?
  @property({ type: String }) title: string = 'no title defined';

  @property({ type: Object }) config: GraphConfig | undefined;

  render() {
    return html`
      <base-card .cardTitle=${this.title}>
        <line-graph .config=${this.config}></line-graph>
      </base-card>
    `;
  }
}
