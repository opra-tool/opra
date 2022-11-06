import { LitElement, html, css } from 'lit';
import { customElement, state, query, property } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import {
  calculateEarlyBassStrength,
  calculateStrength,
  calculateTrebleRatio,
} from '../strength';

type Strengths = {
  strength: Float64Array;
  earlyStrength: Float64Array;
  lateStrength: Float64Array;
};

@customElement('strengths-card')
export class StrengthsCard extends LitElement {
  @property({ type: Array }) bands: Float64Array[] = [];

  @property({ type: Array }) e80Bands: Float64Array[] = [];

  @property({ type: Array }) l80Bands: Float64Array[] = [];

  @query('#p0-input')
  private p0Input!: HTMLInputElement;

  @state()
  private p0: number | undefined;

  @state()
  private strengths: Strengths | undefined;

  render() {
    return html`
      <base-card cardTitle="Strengths">
        ${this.renderP0Input()} ${this.renderCardContent()}
      </base-card>
    `;
  }

  private renderCardContent() {
    if (!this.p0) {
      return html`<p>Enter a value for p0 to calculate strengths</p>`;
    }

    if (!this.strengths) {
      return html`<sl-spinner></sl-spinner>`;
    }

    const { strength, earlyStrength, lateStrength } = this.strengths;

    return html`
      <div class="content">
        <strength-graph
          .strength=${strength}
          .earlyStrength=${earlyStrength}
          .lateStrength=${lateStrength}
        ></strength-graph>

        <table>
          <tr>
            <td>Treble Ratio</td>
            <td>${calculateTrebleRatio(lateStrength).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Early Bass Strength</td>
            <td>${calculateEarlyBassStrength(earlyStrength).toFixed(2)}dB</td>
          </tr>
        </table>
      </div>
    `;
  }

  private renderP0Input() {
    return html`
      <form @submit=${this.onSubmit}>
        <sl-input id="p0-input" type="number" min="0" step="any"></sl-input>
      </form>
    `;
  }

  private onSubmit(ev: SubmitEvent) {
    ev.preventDefault();
    this.p0 = parseFloat(this.p0Input.value);

    this.calculateStrengths();
  }

  private calculateStrengths() {
    if (!this.p0) {
      throw new Error('expected p0 to be defined for strength calculation');
    }

    const strength = calculateStrength(this.bands, this.p0);
    const earlyStrength = calculateStrength(this.e80Bands, this.p0);
    const lateStrength = calculateStrength(this.l80Bands, this.p0);

    this.strengths = {
      strength,
      earlyStrength,
      lateStrength,
    };
  }

  static styles = css`
    .content {
      display: grid;
      gap: 1rem;
      padding: 1rem;
    }
  `;
}
