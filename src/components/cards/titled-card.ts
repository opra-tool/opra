import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('titled-card')
export class TitledCard extends LitElement {
  @property({ type: String }) cardTitle: string | undefined;

  render() {
    return html`
      <base-card>
        ${this.cardTitle && html`<h3>${this.cardTitle}</h3>`}
        <slot></slot>
      </base-card>
    `;
  }

  static styles = css`
    h3 {
      margin: 0.5rem 0 2rem 0;
      font-size: 1rem;
      letter-spacing: 1px;
    }
  `;
}
