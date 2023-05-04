import { localized, msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { soundStrengthFormula } from './formulae';

@localized()
@customElement('strengths-graph-help')
export class StrengthsGraphHelp extends LitElement {
  render() {
    return html`
      <div>
        <p>
          ${msg(`
            Sound strength is a measure of the subjective bass level.
            It is defined as the logarithmic ratio between the sound energy of the impulse response to that of another
            response measured at a distance of 10 meters from the sound source.
            The early sound strength is calculated on samples before the 80ms mark, the late sound strength on samples after 80ms.
            ISO 3382-1 defines the sound strength as
          `)}
          <source-paper paper="iso3382-1" parenthesis></source-paper>:
        </p>

        <div class="formula">${soundStrengthFormula}</div>
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
