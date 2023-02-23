import { localized, msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { isFreeOfNullValues } from '../arrays';
import { LateralLevel } from '../analyzing/lateral-level';
import { ImpulseResponse } from '../analyzing/impulse-response';

@localized()
@customElement('lateral-level-card')
export class LateralLevelCard extends LitElement {
  @property({ type: Number })
  p0: number | null = null;

  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array })
  lateralLevels: (LateralLevel | null)[] = [];

  render() {
    return html`
      <help-card cardTitle=${msg('Lateral Sound Level')}>
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
      this.lateralLevels.length === 0 ||
      !isFreeOfNullValues(this.lateralLevels)
    ) {
      return html`<sl-spinner></sl-spinner>`;
    }

    return html`
      <lateral-level-graph
        .impulseResponses=${this.impulseResponses}
        .lateralLevels=${this.lateralLevels}
      ></lateral-level-graph>
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
