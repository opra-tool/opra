import { msg, localized } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { isFreeOfNullValues } from '../arrays';
import { ResponseDetail } from '../audio/response-detail';
import { Strengths } from '../strength';

@localized()
@customElement('strengths-card')
export class StrengthsCard extends LitElement {
  @property({ type: Number })
  p0: number | null = null;

  @property({ type: Array })
  responseDetails: ResponseDetail[] = [];

  @property({ type: Array })
  strengths: (Strengths | null)[] = [];

  render() {
    return html`
      <base-card cardTitle=${msg('Sound Strength')}>
        ${this.renderCardContent()}
      </base-card>
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

    if (this.strengths.length === 0 || !isFreeOfNullValues(this.strengths)) {
      return html`<sl-spinner></sl-spinner>`;
    }

    return html`
      <strengths-graph
        .responseDetails=${this.responseDetails}
        .strengths=${this.strengths}
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
