import { LitElement, html, css } from 'lit';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.js';
import SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import { customElement, property, query } from 'lit/decorators.js';
import { UNIT_CELCIUS } from '../units';
import { P0_VAR, formatP0 } from '../presentation/p0-format';

export class P0DialogChangeEvent extends CustomEvent<{
  p0: number;
  relativeHumidity: number;
  temperature: number;
}> {}

const MIN_TEMPERATURE = -20;
const MAX_TEMPERATURE = 50;
const MIN_HUMIDITY = 10;
const MAX_HUMIDITY = 100;

@customElement('p0-dialog')
export class P0Dialog extends LitElement {
  @property({ type: Number })
  p0: number | null = null;

  @property({ type: Number })
  relativeHumidity: number = NaN;

  @property({ type: Number })
  temperature: number = NaN;

  @query('.dialog', true)
  private dialog!: SlDialog;

  @query('.p0-input', true)
  private p0Input!: SlInput;

  @query('.temperature-input', true)
  private temperatureInput!: SlInput;

  @query('.humidity-input', true)
  private humidityInput!: SlInput;

  render() {
    return html`
      <sl-dialog ?open=${false} class="dialog">
        <span slot="label">Set ${P0_VAR} and air parameters</span>
        <section>
          <form @submit=${this.onSubmit}>
            <sl-input
              type="number"
              min="0"
              step="any"
              filled
              required
              value=${this.p0 ? formatP0(this.p0) : ''}
              class="p0-input"
            >
              <span slot="label">${P0_VAR}</span>
            </sl-input>

            <sl-input
              label=${`Air Temperature in ${UNIT_CELCIUS}`}
              type="number"
              min=${MIN_TEMPERATURE}
              max=${MAX_TEMPERATURE}
              filled
              required
              value=${this.temperature.toString()}
              class="temperature-input"
            ></sl-input>

            <sl-input
              label="Relative humidity in percent"
              type="number"
              min=${MIN_HUMIDITY}
              max=${MAX_HUMIDITY}
              filled
              required
              value=${this.relativeHumidity.toString()}
              class="humidity-input"
            ></sl-input>

            <sl-button type="submit">Update</sl-button>
          </form>
        </section>
        <section class="persistence-notice">
          <small>Values are stored for your next visit.</small>
        </section>
      </sl-dialog>
    `;
  }

  public show() {
    this.dialog.show();
  }

  public hide() {
    this.dialog.hide();
  }

  private onSubmit(ev: SubmitEvent) {
    ev.preventDefault();

    if (
      this.p0Input.invalid ||
      this.humidityInput.invalid ||
      this.temperatureInput.invalid
    ) {
      return;
    }

    const p0 = parseFloat(this.p0Input.value);
    const relativeHumidity = parseFloat(this.humidityInput.value);
    const temperature = parseFloat(this.temperatureInput.value);

    this.dispatchEvent(
      new P0DialogChangeEvent('change', {
        detail: {
          p0,
          relativeHumidity,
          temperature,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  static styles = css`
    form {
      display: grid;
      gap: 1rem;
    }

    .persistence-notice {
      display: block;
      margin-top: 1rem;
    }
  `;
}
