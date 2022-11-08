import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { UNIT_HERTZ, UNIT_SECONDS } from '../units';

@customElement('audio-info-card')
export class AudioInfoCard extends LitElement {
  @property({ type: String }) fileName: string = 'unknown';

  @property({ type: Number }) channelCount: number = 1;

  @property({ type: Number }) sampleRate: number = 0;

  @property({ type: Number }) durationSeconds: number = 0;

  render() {
    const audioType =
      this.channelCount === 1 ? 'Monaural Audio' : 'Binaural Audio';

    const sampleRate = `${this.sampleRate}${UNIT_HERTZ}`;
    const duration = `${this.durationSeconds.toFixed(2)}${UNIT_SECONDS}`;

    return html`
      <base-card>
        <small
          ><b>${this.fileName}</b> • ${audioType} • ${sampleRate} •
          ${duration}</small
        >
        <div></div>
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
