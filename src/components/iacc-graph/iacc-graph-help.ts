import { localized, msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { iaccFormula, iacfFormula } from './formulae';

@localized()
@customElement('iacc-graph-help')
export class IACCGraphHelp extends LitElement {
  render() {
    return html`
      <div>
        <p>
          ${msg(`
            The interaural cross correlation (IACC) is calculated for binaural room impulse responses.
            These are recorded using an artificial head that simulates the characteristic reflections of the auricle.
            The IACC measures the difference between the impulse response at the right ear and that at the left ear.
            To capture early reflections, the early IACC is calculated over the first 80ms of the impulse response.
            Both are defined by ISO 3382-1 using the interaural cross correlation function (IACF)
          `)}
          <source-paper paper="iso3382-1" parenthesis></source-paper>:
        </p>

        <math-formula>${iacfFormula}</math-formula>

        <math-formula>${iaccFormula}</math-formula>
      </div>
    `;
  }

  static styles = css`
    p {
      line-height: 1.5;
    }
  `;
}
