import { LitElement, html, css } from 'lit';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.js';
import SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import { customElement, property, query, state } from 'lit/decorators.js';
import { UNIT_CELCIUS } from '../units';

export type AirDialogUpdateEventDetail = {
  relativeHumidity: number;
  temperature: number;
};

const MIN_TEMPERATURE = -20;
const MAX_TEMPERATURE = 50;
const MIN_HUMIDITY = 10;
const MAX_HUMIDITY = 100;

@customElement('air-values-dialog')
export class AirValuesDialog extends LitElement {
  @property({
    type: Number,
  })
  relativeHumidity: number = 0;

  @property({
    type: Number,
  })
  temperature: number = 0;

  @query('.dialog', true)
  private dialog!: SlDialog;

  @query('.temperature-input', true)
  private temperatureInput!: SlInput;

  @query('.humidity-input', true)
  private humidityInput!: SlInput;

  render() {
    return html`
      <sl-dialog
        ?open=${false}
        label="Air Temperature and Humidity"
        class="dialog"
      >
        <form @submit=${this.onSubmit}>
          <sl-input
            label=${`Temperature in ${UNIT_CELCIUS}`}
            type="number"
            min=${MIN_TEMPERATURE}
            max=${MAX_TEMPERATURE}
            filled
            value=${this.temperature.toString()}
            class="temperature-input"
          ></sl-input>

          <sl-input
            label="Relative humidity in percent"
            type="number"
            min=${MIN_HUMIDITY}
            max=${MAX_HUMIDITY}
            filled
            value=${this.relativeHumidity.toString()}
            class="humidity-input"
          ></sl-input>

          <sl-button type="submit">Update</sl-button>
        </form>
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

    if (this.humidityInput.invalid || this.temperatureInput.invalid) {
      return;
    }

    const relativeHumidity = parseFloat(this.humidityInput.value);
    const temperature = parseFloat(this.temperatureInput.value);

    this.dispatchEvent(
      new CustomEvent<AirDialogUpdateEventDetail>('air-values-change', {
        detail: {
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
  `;
}
