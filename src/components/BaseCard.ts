import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('base-card')
export class BaseCard extends LitElement {
  @property({ type: String }) cardTitle: string | undefined;

  @property({ type: Boolean }) noPadding: boolean = false;

  render() {
    const classes = classMap({
      card: true,
      'no-padding': this.noPadding,
    });

    return html`
      <div class=${classes}>
        ${this.cardTitle && html`<h3>${this.cardTitle}</h3>`}
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

    .card.no-padding {
      padding: 0;
    }

    h3 {
      margin: 0.5rem 0 2rem 0;
      font-size: 1rem;
      letter-spacing: 1px;
    }
  `;
}
