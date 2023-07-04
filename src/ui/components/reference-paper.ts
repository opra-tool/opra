import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

type Paper = {
  url: string;
  shortName: string;
  longName: string;
};

/**
 * @attr parenthesis
 */
@customElement('reference-paper')
export class ReferencePaper extends LitElement {
  @property({ type: Object })
  paper: Paper | undefined;

  @property({ type: Boolean })
  parenthesis = false;

  render() {
    if (!this.paper) {
      throw new Error('a paper is required');
    }

    let link = html`<a href=${this.paper.url}>${this.paper.shortName}</a>`;

    if (this.parenthesis) {
      link = html`(${link})`;
    }

    return html`<sl-tooltip hoist content=${this.paper.longName}
      >${link}</sl-tooltip
    >`;
  }

  static styles = css`
    a {
      color: inherit;
    }

    sl-tooltip {
      --max-width: none;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'reference-paper': ReferencePaper;
  }
}
