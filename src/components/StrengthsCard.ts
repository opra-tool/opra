import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import {
  calculateAveragedFrequencyStrength,
  calculateEarlyBassStrength,
  calculateStrength,
  calculateStrengthOfAWeighted,
  calculateTrebleRatio,
} from '../strength';
import { Parameter } from './ParametersTable';
import { UNIT_DECIBELS } from '../units';

type Strengths = {
  strength: number[];
  earlyStrength: number[];
  lateStrength: number[];
  aWeighted: number;
  aWeightedC80: number;
};

@customElement('strengths-card')
export class StrengthsCard extends LitElement {
  @property({ type: Object }) bandsSquaredSum: Float64Array =
    new Float64Array();

  @property({ type: Object }) e80BandsSquaredSum: Float64Array =
    new Float64Array();

  @property({ type: Object }) l80BandsSquaredSum: Float64Array =
    new Float64Array();

  @property({ type: Object }) c80Values: Float64Array = new Float64Array();

  @property({ type: Number }) aWeightedSquaredSum: number = 0;

  @state()
  private p0Value: string = '';

  @state()
  private strengths: Strengths | undefined;

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

          <parameters-table .parameters=${parameters}></parameters-table>
        </aside>
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
          .value=${this.p0Value}
          @sl-input=${(ev: CustomEvent) => {
            if (ev.target) {
              this.p0Value = (ev.target as HTMLInputElement).value;
            }
          }}
        ></sl-input>
        <sl-button type="submit"
          >${this.strengths ? 'Recalculate' : 'Calculate'}</sl-button
        >
      </form>
    `;
  }

  private onSubmit(ev: SubmitEvent) {
    ev.preventDefault();

    if (!this.p0Value || Number.isNaN(parseFloat(this.p0Value))) {
      return;
    }

    this.calculateStrengths(parseFloat(this.p0Value));
  }

  private calculateStrengths(p0: number) {
    const strength = calculateStrength(this.bandsSquaredSum, p0);
    const earlyStrength = calculateStrength(this.e80BandsSquaredSum, p0);
    const lateStrength = calculateStrength(this.l80BandsSquaredSum, p0);
    const aWeighted = calculateStrengthOfAWeighted(
      this.aWeightedSquaredSum,
      p0
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
