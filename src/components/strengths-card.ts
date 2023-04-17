import { msg, localized } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponse } from '../analyzing/impulse-response';

@localized()
@customElement('strengths-card')
export class StrengthsCard extends LitElement {
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
    `;
  }
}
