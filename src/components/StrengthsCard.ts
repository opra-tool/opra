import { LitElement, html, css, PropertyValueMap, PropertyValues } from 'lit';
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
  @property({ type: Array }) bandsSquaredSum: number[] = [];

  @property({ type: Array }) e80BandsSquaredSum: number[] = [];

  @property({ type: Array }) l80BandsSquaredSum: number[] = [];

  @property({ type: Array }) c80Values: number[] = [];

  @property({ type: Number }) aWeightedSquaredSum: number = 0;

  @state()
  private strengths: Strengths | undefined;

  @state()
  private p0 = getStoredOrNoP0();

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

  protected updated(changedProperties: PropertyValues<this>) {
    if (
      changedProperties.has('bandsSquaredSum') ||
      changedProperties.has('e80BandsSquaredSum') ||
      changedProperties.has('l80BandsSquaredSum') ||
      changedProperties.has('c80Values') ||
      changedProperties.has('aWeightedSquaredSum')
    ) {
      if (this.p0) {
        this.calculateStrengths();
      }
    }
  }

  render() {
    return html`
      <base-card cardTitle="Strengths"> ${this.renderCardContent()} </base-card>
    `;
  }

  private renderCardContent() {
    if (!this.strengths) {
      return html`
        <div class="intro">
          <p>
            A value for <i>p0</i> is required to calculate absolute strengths.
          </p>
          ${this.renderP0Input()}
        </div>
      `;
    }

    const { strength, earlyStrength, lateStrength, aWeighted, aWeightedC80 } =
      this.strengths;

    const parameters: Parameter[] = [
      {
        name: 'Avg. Strength',
        description: 'according to ISO 3382-1 Table A.2',
        value: calculateAveragedFrequencyStrength(strength),
        unit: UNIT_DECIBELS,
      },
      {
        name: 'Treble Ratio',
        value: calculateTrebleRatio(lateStrength),
      },
      {
        name: 'Early Bass Strength',
        value: calculateEarlyBassStrength(earlyStrength),
        unit: UNIT_DECIBELS,
      },
      {
        name: 'A-Weighted Avg. Strength',
        value: aWeighted,
        unit: UNIT_DECIBELS,
      },
      {
        name: 'A-Weighted Avg. C80',
        value: aWeightedC80,
        unit: UNIT_DECIBELS,
      },
    ];

    return html`
      <div class="content">
        <strength-graph
          .strength=${strength}
          .earlyStrength=${earlyStrength}
          .lateStrength=${lateStrength}
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

          <parameters-table .parameters=${parameters}></parameters-table>
        </aside>

        <air-values-dialog
          relativeHumidity=${this.relativeHumidity}
          temperature=${this.temperature}
          class="air-values-dialog"
          @air-values-change=${this.saveAirDialogValues}
        ></air-values-dialog>
      </div>
    `;
  }

  private renderP0Input() {
    return html`
      <form @submit=${this.onSubmit}>
        <sl-input
          type="number"
          placeholder="e.g. 0.015 or 1e-6"
          filled
          min="0"
          step="any"
          required
          value=${this.p0 ? this.p0.toString() : ''}
          @sl-input=${this.onP0Input}
        ></sl-input>
        <sl-button type="submit"
          >${this.strengths ? 'Recalculate' : 'Calculate'}</sl-button
        >
      </form>
    `;
  }

  private onP0Input(ev: CustomEvent) {
    if (ev.target) {
      this.p0 = parseFloat((ev.target as HTMLInputElement).value);
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

  private onSubmit(ev: SubmitEvent) {
    ev.preventDefault();

    this.calculateStrengths();
    this.persistP0();
  }

  private persistP0() {
    if (this.p0 !== null) {
      localStorage.setItem(P0_STORAGE_KEY, this.p0.toString());
    }
  }

  private async calculateStrengths() {
    if (!this.p0) {
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
    const strength = calculateStrength(this.bandsSquaredSum, this.p0, lpe10);
    const earlyStrength = calculateStrength(
      this.e80BandsSquaredSum,
      this.p0,
      lpe10
    );
    const lateStrength = calculateStrength(
      this.l80BandsSquaredSum,
      this.p0,
      lpe10
    );
    const aWeighted = calculateStrengthOfAWeighted(
      this.aWeightedSquaredSum,
      this.p0
    );
    const aWeightedC80 =
      (this.c80Values[3] + this.c80Values[4]) / 2 - 0.62 * aWeighted;

    this.strengths = {
      strength,
      earlyStrength,
      lateStrength,
      aWeighted,
      aWeightedC80,
    };
  }

  static styles = css`
    .content {
      display: grid;
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
    }
  `;
}
