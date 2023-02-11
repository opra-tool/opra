import { localized, msg, str } from '@lit/localize';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { P0_VAR, formatP0 } from '../presentation/p0-format';
import { UNIT_CELCIUS } from '../presentation/units';

@localized()
@customElement('p0-notice')
export class P0Notice extends LitElement {
  @property({ type: Number })
  p0: number | null = null;

  @property({ type: Number })
  relativeHumidity = NaN;

  @property({ type: Number })
  temperature = NaN;

  protected render() {
    if (this.p0 === null) {
      return html`
        <div class="p0-notice">
          <small>
            ${msg(html`Further values require ${P0_VAR} to be set.`)}
            <a href="#" @click=${this.showAirDialog}
              >${msg(html`Set ${P0_VAR}`)}</a
            >
          </small>
        </div>
      `;
    }

    return html`
      <div class="p0-notice">
        <small>
          ${P0_VAR} = <b>${formatP0(this.p0)}</b>.
          ${msg('An air temperature of')}
          <b>${this.temperature}${UNIT_CELCIUS}</b>
          ${msg('and humidity of')}
          <b>${this.relativeHumidity}%</b>
          ${msg('is assumed.')}
          <a href="#" @click=${this.showAirDialog}>${msg('Change')}</a>
        </small>
      </div>
    `;
  }

  private showAirDialog(ev: PointerEvent) {
    ev.preventDefault();

    this.dispatchEvent(new CustomEvent('show-p0-dialog'));
  }

  static styles = css`
    .p0-notice {
      padding: 0.5rem;
      color: var(--sl-color-neutral-700);
    }
  `;
}
