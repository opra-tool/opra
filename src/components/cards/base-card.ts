import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('base-card')
export class BaseCard extends LitElement {
  render() {
    return html`
      <div class="card">
        <slot></slot>
      </div>
    `;
  }

  static styles = css`
    .card {
      background-color: var(--sl-color-neutral-50);
      padding: 1rem;
      box-shadow: var(--sl-shadow-medium);
      border-radius: 0.5rem;
      box-sizing: border-box;
      height: 100%;
    }
  `;
}
