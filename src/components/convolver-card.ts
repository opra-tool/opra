import { SlSelect } from '@shoelace-style/shoelace';
import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { RoomResponse } from '../audio/room-response';
import { UNIT_SECONDS } from '../units';

type SampleFile = {
  id: string;
  fileName: string;
  label: string;
};

const SAMPLE_FILES: SampleFile[] = [
  {
    id: 'sweep',
    fileName: 'audiocheck.net_sweep_10Hz_10000Hz_-3dBFS_10s.wav',
    label: 'Sweep (20Hz - 10000kHz)',
  },
];

type Playback = {
  id: string;
  fileName: string;
  state: 'playing' | 'paused';
  currentTime: number;
  duration: number;
  audioEl: HTMLAudioElement;
  ctx: AudioContext;
  source: MediaElementAudioSourceNode;
  convolver: ConvolverNode | null;
};

@customElement('convolver-card')
export class ConvolverCard extends LitElement {
  @property({ type: Array })
  responses: RoomResponse[] = [];

  // not marked as @state() as updates are manually requested
  private playback: Playback | null = null;

  // not marked as @state() as updates are manually requested
  private durations = new Map<string, number>();

  @query('#room-response-select', true)
  private selectEl!: SlSelect;

  protected render() {
    if (!this.responses.length) {
      return null;
    }

    return html`
      <base-card cardTitle="Playback audio based on a room response">
        <sl-select
          id="room-response-select"
          value="none"
          @sl-change=${this.onResponseSelected}
        >
          <sl-menu-item value="none">No effect</sl-menu-item>
          ${this.responses.map(
            r => html`
              <sl-menu-item value=${r.id}>${r.fileName}</sl-menu-item>
            `
          )}
        </sl-select>
        <ul class="playback-list">
          ${SAMPLE_FILES.map(this.renderSampleFile.bind(this))}
        </ul>
      </base-card>
    `;
  }

  private renderSampleFile({ id, label, fileName }: SampleFile) {
    const isCurrent = this.playback?.id === id;
    const isPlaying = isCurrent && this.playback?.state === 'playing';

    let progress = 0;
    const duration = Math.floor(this.durations.get(id) || 0);
    if (duration && this.playback?.currentTime) {
      progress = (this.playback?.currentTime / duration) * 100;
    }

    return html`
      <li class="playback-list-entry">
        <p>${label}</p>
        <p>
          <span>${duration} ${UNIT_SECONDS}</span>
        </p>
        <sl-icon-button
          name=${isPlaying ? 'pause-fill' : 'play-fill'}
          @click=${() => this.onPlay(id, fileName)}
        ></sl-icon-button>
        <audio
          src=${`/assets/sounds/${fileName}`}
          preload="metadata"
          style="display: none;"
          @durationchange=${(ev: Event) => {
            this.setDuration(id, (ev.target as HTMLAudioElement).duration);
          }}
        ></audio>
        ${isCurrent
          ? html`
              <div class="progress">
                <div class="value" style=${`width: ${progress}%`}></div>
              </div>
            `
          : null}
      </li>
    `;
  }

  private setDuration(id: string, duration: number) {
    this.durations.set(id, duration);
    this.requestUpdate();
  }

  // eslint-disable-next-line class-methods-use-this
  private async onResponseSelected() {
    if (this.playback) {
      const { currentTime } = this.playback;

      const wasPlaying = this.playback.state === 'playing';

      await this.createPlayback(this.playback.id, this.playback.fileName);

      this.playback.audioEl.currentTime = currentTime;
      if (wasPlaying) {
        this.playback.audioEl.play();
      }
    }
  }

  private togglePlayPause() {
    if (!this.playback) {
      throw new Error('[ConvolverCard] illegal state: no current playback');
    }

    if (this.playback.currentTime >= this.playback.duration) {
      this.playback.audioEl.currentTime = 0;
      this.playback.audioEl.play();
    } else if (this.playback.state === 'playing') {
      this.playback.audioEl.pause();
    } else {
      this.playback.audioEl.play();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private async onPlay(id: string, fileName: string) {
    if (this.playback && this.playback.id === id) {
      this.togglePlayPause();
    } else {
      await this.createPlayback(id, fileName);
      this.playback?.audioEl.play();
    }
  }

  private async createPlayback(id: string, fileName: string) {
    if (this.playback) {
      this.playback.audioEl.pause();
      this.playback.audioEl.src = '';

      this.playback.source.disconnect();
      this.playback.convolver?.disconnect();
      await this.playback.ctx.close();
    }

    const response = this.getCurrentResponse();
    const ctx = this.createAudioContext(response);
    const audioEl = document.createElement('audio');
    audioEl.src = `/assets/sounds/${fileName}`;
    audioEl.addEventListener('timeupdate', ev => {
      if (!this.playback) {
        return;
      }

      const { currentTime, duration } = ev.target as HTMLAudioElement;
      this.playback.currentTime = currentTime;
      this.playback.duration = duration;
      this.requestUpdate();
    });
    audioEl.addEventListener('play', () => {
      if (!this.playback) {
        return;
      }

      this.playback.state = 'playing';
      this.requestUpdate();
    });
    audioEl.addEventListener('pause', () => {
      if (!this.playback) {
        return;
      }

      this.playback.state = 'paused';
      this.requestUpdate();
    });

    const source = ctx.createMediaElementSource(audioEl);

    let convolver = null;

    if (response) {
      convolver = ctx.createConvolver();
      convolver.buffer = response.buffer;
      convolver.normalize = false;

      source.connect(convolver);
      convolver.connect(ctx.destination);
    } else {
      source.connect(ctx.destination);
    }

    this.playback = {
      state: 'paused',
      id,
      fileName,
      audioEl,
      ctx,
      convolver,
      source,
      currentTime: 0,
      duration: this.durations.get(id) || 0,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private createAudioContext(response: RoomResponse | null) {
    if (!response) {
      return new AudioContext();
    }

    return new AudioContext({
      sampleRate: response.sampleRate,
    });
  }

  private getCurrentResponse(): RoomResponse | null {
    const { value } = this.selectEl;
    const id = value instanceof Array ? value[0] : value;

    if (id === 'none') {
      return null;
    }

    const response = this.responses.find(r => r.id === id);

    if (!response) {
      throw new Error(`[ConvolverCard] no response with id '${id}'`);
    }

    return response;
  }

  static styles = css`
    ul.playback-list {
      background: var(--sl-color-neutral-100);
      border-radius: 0.5rem;
      padding: 0.25rem;
      box-sizing: border-box;
      list-style: none;
    }

    li.playback-list-entry {
      position: relative;
      display: grid;
      grid-template-columns: 1fr auto auto;
      align-items: center;
      gap: 0 1rem;
      padding: 0.25rem 0.75rem;
    }

    li.playback-list-entry:not(:last-child) {
      border-bottom: 1px solid var(--sl-color-neutral-200);
    }

    .progress {
      grid-column: 1 / -1;
      height: 4px;
      margin-bottom: 0.25rem;
      border-radius: 2px;
      overflow: hidden;
      background-color: var(--sl-color-neutral-300);
    }

    .progress .value {
      height: 100%;
      background-color: var(--sl-color-neutral-1000);
      transition: width 0.25s;
    }

    sl-icon-button {
      font-size: 1.4rem;
    }
  `;
}
