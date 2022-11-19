import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, state, property, query } from 'lit/decorators.js';
import {
  calculateAveragedFrequencyStrength,
  calculateEarlyBassStrength,
  calculateStrength,
  calculateStrengthOfAWeighted,
  calculateTrebleRatio,
} from '../strength';
import { Parameter } from './ParametersTable';
import { UNIT_CELCIUS, UNIT_DECIBELS } from '../units';
import { calculateLpe10 } from '../lpe10';
import { calculateSoundDampingInAir } from '../dampening';
import { getFrequencyValues } from './graphs/common';
import { AirValuesDialog, AirDialogUpdateEventDetail } from './AirValuesDialog';

type Strengths = {
  strength: number[];
  earlyStrength: number[];
  lateStrength: number[];
  aWeighted: number;
  aWeightedC80: number;
};

type Input = {
  fileName: string;
  color: string;
  bandsSquaredSum: number[];
  e80BandsSquaredSum: number[];
  l80BandsSquaredSum: number[];
  c80Bands: number[];
  aWeightedSquaredSum: number;
};

const P0_STORAGE_KEY = 'strengths-p0';
const TEMPERATURE_STORAGE_KEY = 'strengths-temperature';
const HUMIDITY_STORAGE_KEY = 'strengths-humidity';

const DEFAULT_RELATIVE_HUMIDITY = 50;
const DEFAULT_TEMPERATURE = 20;

function getStoredValueOrDefault(key: string, defaultValue: number): number {
  const stored = localStorage.getItem(key);

  if (stored === null) {
    return defaultValue;
  }

  return parseFloat(stored);
}

function getStoredOrDefaultHumidity(): number {
  return getStoredValueOrDefault(
    HUMIDITY_STORAGE_KEY,
    DEFAULT_RELATIVE_HUMIDITY
  );
}

function getStoredOrDefaultTemperature(): number {
  return getStoredValueOrDefault(TEMPERATURE_STORAGE_KEY, DEFAULT_TEMPERATURE);
}

function getStoredOrNoP0(): number | null {
  const stored = localStorage.getItem(P0_STORAGE_KEY);

  if (stored === null) {
    return null;
  }

  return parseFloat(stored);
}

@customElement('strengths-card')
export class StrengthsCard extends LitElement {
  @property({ type: Array }) inputs: Input[] = [];

  @state()
  private strengths: Strengths[] = [];

  @state()
  private p0 = getStoredOrNoP0();

  @state()
  private p0InputValue = this.p0 ? this.p0.toString() : '';

  @state()
  private relativeHumidity = getStoredOrDefaultHumidity();

  @state()
  private temperature = getStoredOrDefaultTemperature();

  @query('.air-values-dialog', true)
  private airValuesDialog!: AirValuesDialog;

  protected firstUpdated() {
    if (this.p0 !== null) {
      this.calculateStrengths();
    }
  }

  protected willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('inputs')) {
      this.strengths = [];
    }
  }

  protected updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('inputs')) {
      if (this.p0) {
        this.calculateStrengths();
      }
    }
  }

  render() {
    return html`
      <base-card cardTitle="Strengths">${this.renderCardContent()}</base-card>
    `;
  }

  private renderCardContent() {
    if (!this.p0) {
      return html`
        <div class="intro">
          <p>
            A value for <i>p0</i> is required to calculate absolute strengths.
          </p>
          ${this.renderP0Input()}
        </div>
      `;
    }

    if (!this.strengths.length) {
      return html`<sl-spinner></sl-spinner>`;
    }

    return html`
      <div class="content">
        <strength-graph
          .strengths=${this.strengths.map(({ strength: values }, i) => ({
            color: this.inputs[i].color,
            values,
          }))}
          .earlyStrengths=${this.strengths.map(
            ({ earlyStrength: values }, i) => ({
              color: this.inputs[i].color,
              values,
            })
          )}
          .lateStrengths=${this.strengths.map(
            ({ lateStrength: values }, i) => ({
              color: this.inputs[i].color,
              values,
            })
          )}
        ></strength-graph>

        <sl-divider vertical></sl-divider>

        <aside>
          ${this.renderP0Input()}

          <div class="air-notice">
            <p>
              An air temperature of ${this.temperature}${UNIT_CELCIUS} and
              humidity of ${this.relativeHumidity}% is assumed.
              <a href="#" @click=${this.showAirDialog}>Change</a>
            </p>
          </div>

          ${this.strengths.length === 1 ? this.renderParamsTable() : null}
        </aside>

        ${this.strengths.length > 1 ? this.renderParamsTable() : null}

        <air-values-dialog
          relativeHumidity=${this.relativeHumidity}
          temperature=${this.temperature}
          class="air-values-dialog"
          @air-values-change=${this.saveAirDialogValues}
        ></air-values-dialog>
      </div>
    `;
  }

  private renderParamsTable() {
    const params: Parameter[] = [
      {
        name: 'Avg. Strength',
        description: 'according to ISO 3382-1 Table A.2',
        responseValues: this.strengths.map(({ strength }, i) => ({
          fileName: this.inputs[i].fileName,
          color: this.inputs[i].color,
          value: calculateAveragedFrequencyStrength(strength),
        })),
        unit: UNIT_DECIBELS,
      },
      {
        name: 'Treble Ratio',
        responseValues: this.strengths.map(({ lateStrength }, i) => ({
          fileName: this.inputs[i].fileName,
          color: this.inputs[i].color,
          value: calculateTrebleRatio(lateStrength),
        })),
      },
      {
        name: 'Early Bass Strength',
        responseValues: this.strengths.map(({ earlyStrength }, i) => ({
          fileName: this.inputs[i].fileName,
          color: this.inputs[i].color,
          value: calculateEarlyBassStrength(earlyStrength),
        })),
        unit: UNIT_DECIBELS,
      },
      {
        name: 'A-Weighted Avg. Strength',
        responseValues: this.strengths.map(({ aWeighted }, i) => ({
          fileName: this.inputs[i].fileName,
          color: this.inputs[i].color,
          value: aWeighted,
        })),
        unit: UNIT_DECIBELS,
      },
      {
        name: 'A-Weighted Avg. C80',
        responseValues: this.strengths.map(({ aWeightedC80 }, i) => ({
          fileName: this.inputs[i].fileName,
          color: this.inputs[i].color,
          value: aWeightedC80,
        })),
        unit: UNIT_DECIBELS,
      },
    ];

    return html`<parameters-table .parameters=${params}></parameters-table>`;
  }

  private renderP0Input() {
    return html`
      <form @submit=${this.onSubmitP0}>
        <sl-input
          type="number"
          placeholder="e.g. 0.015 or 1e-6"
          filled
          min="0"
          step="any"
          required
          value=${this.p0InputValue}
          @sl-input=${this.onP0Input}
        ></sl-input>
        <sl-button type="submit"
          >${this.strengths.length ? 'Recalculate' : 'Calculate'}</sl-button
        >
      </form>
    `;
  }

  private onP0Input(ev: CustomEvent) {
    if (ev.target) {
      this.p0InputValue = (ev.target as HTMLInputElement).value;
    }
  }

  private showAirDialog(ev: PointerEvent) {
    ev.preventDefault();

    this.airValuesDialog.show();
  }

  private saveAirDialogValues(ev: CustomEvent<AirDialogUpdateEventDetail>) {
    ev.preventDefault();

    this.temperature = ev.detail.temperature;
    this.relativeHumidity = ev.detail.relativeHumidity;

    localStorage.setItem(TEMPERATURE_STORAGE_KEY, this.temperature.toString());
    localStorage.setItem(
      HUMIDITY_STORAGE_KEY,
      this.relativeHumidity.toString()
    );

    this.airValuesDialog.hide();

    this.calculateStrengths();
  }

  private onSubmitP0(ev: SubmitEvent) {
    ev.preventDefault();

    if (this.p0InputValue !== '') {
      this.p0 = parseFloat(this.p0InputValue);
      localStorage.setItem(P0_STORAGE_KEY, this.p0.toString());

      this.calculateStrengths();
    }
  }

  private async calculateStrengths() {
    const { p0 } = this;
    if (!p0) {
      throw new Error('expected p0 to be defined');
    }

    const airCoeffs = getFrequencyValues().map(frequency =>
      calculateSoundDampingInAir(
        this.temperature,
        this.relativeHumidity,
        frequency
      )
    );
    const lpe10 = await calculateLpe10(airCoeffs);

    this.strengths = this.inputs.map(
      ({
        bandsSquaredSum,
        e80BandsSquaredSum,
        l80BandsSquaredSum,
        aWeightedSquaredSum,
        c80Bands,
      }) => {
        const aWeighted = calculateStrengthOfAWeighted(aWeightedSquaredSum, p0);

        return {
          strength: calculateStrength(bandsSquaredSum, p0, lpe10),
          earlyStrength: calculateStrength(e80BandsSquaredSum, p0, lpe10),
          lateStrength: calculateStrength(l80BandsSquaredSum, p0, lpe10),
          aWeighted,
          aWeightedC80: (c80Bands[3] + c80Bands[4]) / 2 - 0.62 * aWeighted,
        };
      }
    );
  }

  static styles = css`
    .content {
      display: grid;
      row-gap: 2rem;
      grid-template-columns: 2fr auto 1fr;
    }

    .intro {
      display: grid;
      justify-content: center;
      align-items: center;
      max-width: 14rem;
      margin: 0 auto;
      padding: 2rem;
    }

    aside {
      display: flex;
      flex-direction: column;
      padding: 1rem;
    }

    form {
      display: grid;
      gap: 1rem;
    }

    parameters-table {
      margin-top: auto;
      grid-column: 1 / -1;
      /* prevent stretching of parent */
      min-width: 0;
    }
  `;
}
