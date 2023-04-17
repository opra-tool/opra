import { localized, msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponse } from '../analyzing/impulse-response';

@localized()
@customElement('lateral-sound-level-card')
export class LateralSoundLevelCard extends LitElement {
  @property({ type: Array })
  impulseResponses: ImpulseResponse[] = [];

  @property({ type: Array })
  earlyLateralSoundLevels: number[][] = [];

  @property({ type: Array })
  lateLateralSoundLevels: number[][] = [];

  render() {
    return html`
      <help-card cardTitle=${msg('Lateral Sound Level')}>
        ${this.renderCardContent()}

        <div slot="help">TODO</div>
      </help-card>
    `;
  }

  private renderCardContent() {
    if (
      this.earlyLateralSoundLevels.length === 0 ||
      this.lateLateralSoundLevels.length === 0
    ) {
      return html`<sl-spinner></sl-spinner>`;
    }

    return html`
      <lateral-sound-level-graph
        .impulseResponses=${this.impulseResponses}
        .earlyLateralSoundLevels=${this.earlyLateralSoundLevels}
        .lateLateralSoundLevels=${this.lateLateralSoundLevels}
      ></lateral-sound-level-graph>
    `;
  }
}
