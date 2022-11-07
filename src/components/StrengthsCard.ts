import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/divider/divider.js';
import {
  calculateAveragedFrequencyStrength,
  calculateEarlyBassStrength,
  calculateStrength,
  calculateTrebleRatio,
} from '../strength';
import { Parameter } from './ParametersTable';

type Strengths = {
  strength: Float64Array;
  earlyStrength: Float64Array;
  lateStrength: Float64Array;
};

@customElement('strengths-card')
export class StrengthsCard extends LitElement {
  @property({ type: Object }) bandsSquaredSum: Float64Array =
    new Float64Array();

  @property({ type: Object }) e80BandsSquaredSum: Float64Array =
    new Float64Array();

  @property({ type: Object }) l80BandsSquaredSum: Float64Array =
    new Float64Array();

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

    const { strength, earlyStrength, lateStrength } = this.strengths;

    const parameters: Parameter[] = [
      {
        name: 'Averaged Strength',
        description: 'according to ISO 3382-1 Table A.2',
        value: calculateAveragedFrequencyStrength(strength),
        unit: 'dB',
      },
      {
        name: 'Treble Ratio',
        value: calculateTrebleRatio(lateStrength),
      },
      {
        name: 'Early Bass Strength',
        value: calculateEarlyBassStrength(earlyStrength),
        unit: 'dB',
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

    this.strengths = {
      strength,
      earlyStrength,
      lateStrength,
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
