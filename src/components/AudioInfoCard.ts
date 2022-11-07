import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UNIT_HERTZ, UNIT_SECONDS } from '../units';

@customElement('audio-info-card')
export class AudioInfoCard extends LitElement {
  @property({ type: Number }) channelCount: number = 1;

  @property({ type: Number }) sampleRate: number = 0;

  @property({ type: Number }) durationSeconds: number = 0;

  render() {
    const audioType =
      this.channelCount === 1 ? 'Monaural Audio' : 'Binaural Audio';

    return html`
      <base-card>
        <div>
          <p class="type">${audioType}</p>
          <p>${this.sampleRate}${UNIT_HERTZ}</p>
          <p>${this.durationSeconds.toFixed(2)}${UNIT_SECONDS}</p>
        </div>
      </base-card>
    `;
  }

  static styles = css`
    div {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
    }

    p {
      font-weight: bold;
      text-align: center;
    }
  `;
}
