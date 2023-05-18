import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

const ELEMENT_NAME = 'math-formula';

@customElement(ELEMENT_NAME)
export class MathFormula extends LitElement {
  render() {
    return html`
      <div class="formula">
        <slot></slot>
      </div>
    `;
  }

  static styles = css`
    .formula {
      padding: 1rem;
      font-size: 1.25rem;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    [ELEMENT_NAME]: MathFormula;
  }
}
