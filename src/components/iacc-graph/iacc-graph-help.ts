import { localized, msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { iaccFormula, iacfFormula } from './formulae';

@localized()
@customElement('iacc-graph-help')
export class IACCGraphHelp extends LitElement {
  render() {
    // TODO: translate
    return html`
      <div>
        <p>
          ${msg(
            'The interaural cross correlation describes the covariance of two signals versus their time shift. It produces values from -1 to +1, where:'
          )}
        </p>
        <ul>
          <li>
            <b>-1</b> perfect correlation, but with a 180° phase inversion
            between the signals
          </li>
          <li><b>0</b> no correlation; completely independent signals</li>
          <li><b>+1</b> perfect correlation; the two signals are identical</li>
        </ul>

        <p>
          ${msg(
            'It is defined through the interaural cross correlation function'
          )}
        </p>

        ${iacfFormula}

        <p>
          ${msg(
            'The interaural cross correlation coefficient is then calculated as'
          )}
        </p>

        ${iaccFormula}

        <p>
          <small
            >${msg('See ')}
            <a
              href="https://asastandards.org/terms/interaural-cross-correlation/"
            >
              ${msg('IACC on the ASA website')}
            </a>
          </small>
        </p>
      </div>
    `;
  }

  static styles = css``;
}
