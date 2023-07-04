import katex from 'katex';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

const ELEMENT_NAME = 'math-formula';

@customElement(ELEMENT_NAME)
export class MathFormula extends LitElement {
  @property() formula: string = '';

  render() {
    return html`
      <div class="formula">
        ${unsafeHTML(
          katex.renderToString(this.formula, {
            displayMode: true,
            output: 'mathml',
          })
        )}
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
