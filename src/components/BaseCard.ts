import { LitElement, html, css } from 'lit';

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
      padding: 1rem;
      box-shadow: 0 12px 17px 2px rgb(0 0 0 / 14%),
        0 5px 22px 4px rgb(0 0 0 / 12%), 0 7px 8px -4px rgb(0 0 0 / 20%);
      border-radius: 0.5rem;
    }
  `;
}
