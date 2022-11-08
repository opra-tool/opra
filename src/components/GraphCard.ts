import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { GraphConfig } from './graphs/LineGraph';

@customElement('graph-card')
export class GraphCard extends LitElement {
  // TODO: how to deal with required properties without initialization?
  @property({ type: String }) title: string = 'no title defined';

  @property({ type: Object }) config: GraphConfig | undefined;

  @property({ type: String }) width: string | undefined;

  @property({ type: String }) height: string | undefined;

  render() {
    return html`
      <base-card .cardTitle=${this.title}>
        <line-graph
          .config=${this.config}
          width=${ifDefined(this.width)}
          height=${ifDefined(this.height)}
        ></line-graph>
      </base-card>
    `;
  }
}
