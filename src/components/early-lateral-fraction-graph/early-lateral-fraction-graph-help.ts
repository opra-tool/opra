import { localized, msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { earlyLateralFractionFormula } from './formulae';

@localized()
@customElement('early-lateral-fraction-graph-help')
export class EarlyLateralFractionGraphHelp extends LitElement {
  render() {
    return html`
      <div>
        <p>
          ${msg(`
            The early lateral energy fraction is a measure of the apparent source width of a room impulse response.
            ISO 3382-1 defines it as
          `)}
          <source-paper paper="iso3382-1" parenthesis></source-paper>:
        </p>

        <div class="formula">${earlyLateralFractionFormula}</div>
      </div>
    `;
  }

  static styles = css`
    p {
      line-height: 1.5;
    }

    .formula {
      padding: 1rem;
      font-size: 1.25rem;
    }
  `;
}
