import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('base-card')
export class BaseCard extends LitElement {
  @property({ type: String }) cardTitle: string | undefined;

  render() {
    return html`
      <div class="card">
        ${this.cardTitle && html`<h3>${this.cardTitle}</h3>`}
        <slot></slot>
      </div>
    `;
  }

  static styles = css`
    .card {
      background-color: #222;
      padding: 1rem;
      box-shadow: 0 6px 12px 2px rgb(0 0 0 / 14%),
        0 3px 11px 2px rgb(0 0 0 / 12%), 0 3px 4px -2px rgb(0 0 0 / 20%);
      border-radius: 0.5rem;
    }

    h3 {
      margin: 0.5rem 0 2rem 0;
      font-size: 1rem;
      letter-spacing: 1px;
    }
  `;
}
