import { LitElement, html, css } from 'lit';
import SlInput from '@shoelace-style/shoelace/dist/components/input/input.js';
import SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import { customElement, property, query } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';
import { EnvironmentValues } from '../transfer-objects/environment-values';

export class EnvironmentChangeEvent extends CustomEvent<EnvironmentValues> {
  constructor(values: EnvironmentValues) {
    super('change', {
      detail: values,
      bubbles: true,
      composed: true,
    });
  }
}

const MIN_TEMPERATURE = -20;
const MAX_TEMPERATURE = 50;
const MIN_HUMIDITY = 10;
const MAX_HUMIDITY = 100;

@localized()
@customElement('environment-dialog')
export class EnvironmentDialog extends LitElement {
  @property({ type: Object })
  values: EnvironmentValues = {
    airTemperature: NaN,
    distanceFromSource: NaN,
    relativeHumidity: NaN,
  };

  @query('.dialog', true)
  private dialog!: SlDialog;

  @query('.temperature-input', true)
  private temperatureInput!: SlInput;

  @query('.humidity-input', true)
  private humidityInput!: SlInput;

  @query('.distance-input', true)
  private distanceInput!: SlInput;

  @query('.source-power-input', true)
  private sourcePowerInput!: SlInput;

  @query('.air-density-input', true)
  private airDensityInput!: SlInput;

  @query('.reference-pressure-input', true)
  private referencePressureInput!: SlInput;

  protected render() {
    return html`
      <sl-dialog ?open=${false} class="dialog">
        <span slot="label">${msg('Set environment values')}</span>
        <section class="content">
          <p>
            ${msg(
              'Set environment values for sound strength and related parameters.'
            )}
          </p>
          <form @submit=${this.onSubmit}>
            <sl-input
              label=${msg('Air Temperature [°C]')}
              type="number"
              min=${MIN_TEMPERATURE}
              max=${MAX_TEMPERATURE}
              step="0.01"
              filled
              required
              class="temperature-input"
            ></sl-input>

            <sl-input
              label=${msg('Relative humidity [%]')}
              type="number"
              min=${MIN_HUMIDITY}
              max=${MAX_HUMIDITY}
              step="0.01"
              filled
              required
              class="humidity-input"
            ></sl-input>

            <sl-input
              label=${msg('Distance from sound source [m]')}
              type="number"
              min="0"
              step="0.01"
              filled
              required
              class="distance-input"
            ></sl-input>

            <sl-divider></sl-divider>

            <p>
              ${msg(
                'More accurate results can be achieved when the power of the sound source and the reference pressure are known.'
              )}
              ${msg(
                'The reference pressure is expected to define the digital amplitude which equals a sound pressure of 1 Pascal.'
              )}
              ${msg('These values are optional.')}
            </p>

            <sl-input
              label=${msg('Sound source power [W]')}
              type="number"
              min="0"
              step="0.01"
              filled
              class="source-power-input"
              @sl-input=${this.resetAdvancedValuesValidity}
            ></sl-input>

            <sl-input
              type="number"
              min="0"
              step="0.01"
              filled
              class="air-density-input"
              @sl-input=${this.resetAdvancedValuesValidity}
            >
              <span slot="label">${msg('Air density')} [kg/m<sup>3</sup>]</span>
            </sl-input>

            <sl-input
              label=${msg('Reference pressure')}
              type="number"
              min="0"
              step="0.01"
              filled
              class="reference-pressure-input"
              @sl-input=${this.resetAdvancedValuesValidity}
            ></sl-input>

            <sl-divider></sl-divider>

            <sl-button type="submit"
              >${msg('Set environment values')}</sl-button
            >
          </form>
          <section class="persistence-notice">
            <small
              >${msg(
                'Values are stored in the browser for your next visit.'
              )}</small
            >
          </section>
        </section>
      </sl-dialog>
    `;
  }

  public show() {
    const {
      airTemperature,
      distanceFromSource,
      relativeHumidity,
      airDensity,
      referencePressure,
      sourcePower,
    } = this.values;

    this.temperatureInput.value = airTemperature.toString();
    this.humidityInput.value = relativeHumidity.toString();
    this.distanceInput.value = distanceFromSource.toString();

    if (referencePressure !== undefined) {
      this.referencePressureInput.value = referencePressure.toString();
    }

    if (sourcePower !== undefined) {
      this.sourcePowerInput.value = sourcePower.toString();
    }

    if (airDensity !== undefined) {
      this.airDensityInput.value = airDensity.toString();
    }

    this.dialog.show();
  }

  public hide() {
    this.dialog.hide();
  }

  private onSubmit(ev: SubmitEvent) {
    ev.preventDefault();

    if (
      !this.humidityInput.reportValidity() ||
      !this.temperatureInput.reportValidity() ||
      !this.distanceInput.reportValidity() ||
      !this.sourcePowerInput.reportValidity() ||
      !this.airDensityInput.reportValidity() ||
      !this.referencePressureInput.reportValidity()
    ) {
      return;
    }

    if (this.areAdvancedValuesInvalid()) {
      if (this.referencePressureInput.value === '') {
        this.referencePressureInput.setCustomValidity(
          msg('This parameter is required when a sound source power is set.')
        );
      }

      if (this.sourcePowerInput.value === '') {
        this.sourcePowerInput.setCustomValidity(
          msg('This parameter is required when a reference pressure is set.')
        );
      }

      if (this.airDensityInput.value === '') {
        this.airDensityInput.setCustomValidity(
          msg(
            'This parameter is required when a reference pressure or sound source power is set.'
          )
        );
      }

      return;
    }

    this.dispatchEvent(
      new EnvironmentChangeEvent({
        airTemperature: parseFloat(this.temperatureInput.value),
        distanceFromSource: parseFloat(this.distanceInput.value),
        relativeHumidity: parseFloat(this.humidityInput.value),
        sourcePower:
          this.sourcePowerInput.value !== ''
            ? parseFloat(this.sourcePowerInput.value)
            : undefined,
        airDensity:
          this.airDensityInput.value !== ''
            ? parseFloat(this.airDensityInput.value)
            : undefined,
        referencePressure:
          this.referencePressureInput.value !== ''
            ? parseFloat(this.referencePressureInput.value)
            : undefined,
      })
    );
  }

  private areAdvancedValuesInvalid(): boolean {
    const atLeastOneIsSet =
      this.sourcePowerInput.value !== '' ||
      this.referencePressureInput.value !== '';
    const atLeastOneIsNotSet =
      this.sourcePowerInput.value === '' ||
      this.referencePressureInput.value === '' ||
      this.airDensityInput.value === '';

    return atLeastOneIsSet && atLeastOneIsNotSet;
  }

  private resetAdvancedValuesValidity() {
    this.sourcePowerInput.setCustomValidity('');
    this.airDensityInput.setCustomValidity('');
    this.referencePressureInput.setCustomValidity('');
  }

  static styles = css`
    .content {
      display: grid;
      gap: 1rem;
    }

    p {
      margin: 0;
    }

    form {
      display: grid;
      gap: 1rem;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'environment-dialog': EnvironmentDialog;
  }
}
