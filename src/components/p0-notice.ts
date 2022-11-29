import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { P0_VAR, formatP0 } from '../presentation/p0-format';
import { UNIT_CELCIUS } from '../units';

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
            Further values require ${P0_VAR} to be set.
            <a href="#" @click=${this.showAirDialog}>Set ${P0_VAR}</a>
          </small>
        </div>
      `;
    }

    return html`
      <div class="p0-notice">
        <small>
          ${P0_VAR} is set to <b>${formatP0(this.p0)}</b>. An air temperature of
          <b>${this.temperature}${UNIT_CELCIUS}</b> and humidity of
          <b>${this.relativeHumidity}%</b> is assumed.
          <a href="#" @click=${this.showAirDialog}>Change</a>
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
