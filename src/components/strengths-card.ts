import { msg, localized } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponse } from '../analyzing/impulse-response';

@localized()
@customElement('strengths-card')
export class StrengthsCard extends LitElement {
  @property({ type: Number })
  p0: number | null = null;

  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array })
  strengths: number[][] = [];

  @property({ type: Array })
  earlyStrengths: number[][] = [];

  @property({ type: Array })
  lateStrengths: number[][] = [];

  render() {
    return html`
      <help-card cardTitle=${msg('Sound Strength')}>
        ${this.renderCardContent()}

        <div slot="help">TODO</div>
      </help-card>
    `;
  }

  private renderCardContent() {
    if (this.p0 === null) {
      return html`
        <div class="p0-setting">
          <slot name="p0-setting"></slot>
        </div>
      `;
    }

    if (
      this.strengths.length === 0 ||
      this.earlyStrengths.length === 0 ||
      this.lateStrengths.length === 0
    ) {
      return html`<sl-spinner></sl-spinner>`;
    }

    return html`
      <strengths-graph
        .impulseResponses=${this.impulseResponses}
        .strengths=${this.strengths}
        .earlyStrengths=${this.earlyStrengths}
        .lateStrengths=${this.lateStrengths}
      ></strengths-graph>
      <slot name="p0-notice"></slot>
    `;
  }

  static styles = css`
    .p0-setting {
      display: grid;
      justify-content: center;
      align-items: center;
      max-width: 14rem;
      margin: 0 auto;
      padding: 2rem;
    }
  `;
}
