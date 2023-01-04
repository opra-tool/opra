import { SlCheckbox, SlSelect } from '@shoelace-style/shoelace';
import { LitElement, html, css } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ConvolverBufferPlaybackSource, ConvolverPlaybackSource, ConvolverStreamPlaybackSource } from './convolver-playback-source';
import { ConvolverPlayback } from './convolver-playback';
import { readAudioFile } from '../audio/audio-file-reading';
import { RoomResponse } from '../audio/room-response';
import { UNIT_SECONDS } from '../units';
import { FileDropChangeEvent } from '../components/file-drop';

type SampleFile = {
  fileName: string;
  label: string;
  credit?: string;
};

type CustomFile = {
  fileName: string;
  buffer: AudioBuffer;
};

const SAMPLE_FILES: SampleFile[] = [
  {
    fileName: 'sax_BerniesTune_excerpt.wav',
    label: 'Bernies Tune (Saxophon)',
    credit: 'Saxophon: Aleksander Labuda, Aufnahme: Daniel Labuda',
  },
  {
    fileName: 'voiceM_Archimedes_short.wav',
    label: 'Archimedes Voice',
    credit: 'Hansen / Munch, 1991',
  },
];

const NO_EFFECT = 'none';

@customElement('convolver-card')
export class ConvolverCard extends LitElement {
  @property({ type: Array })
  responses: RoomResponse[] = [];

  // not marked as @state() as updates are manually requested
  private playback: ConvolverPlayback | null = null;

  // not marked as @state() as updates are manually requested
  private durations = new Map<string, number>();

  @state()
  private customFiles: CustomFile[] = [];

  @query('#room-response-select', true)
  private selectEl!: SlSelect;

  @query('#normalize-checkbox', true)
  private normalizeCheckboxEl!: SlCheckbox;

  @query('#file-input')
  private fileInput!: HTMLInputElement;

  updated() {
    if (this.selectEl) {
      const id = this.getSelectedResponseId();
      if (id !== NO_EFFECT && !this.responses.find(r => r.id === id)) {
        this.selectEl.value = NO_EFFECT;
      }
    }
  }

  protected render() {
    if (!this.responses.length) {
      return null;
    }

    return html`
      <base-card cardTitle="Playback audio based on a room response">
        <section>
          <sl-select
            id="room-response-select"
            value=${NO_EFFECT}
            @sl-change=${this.onResponseSelected}
          >
            <sl-menu-item value=${NO_EFFECT}>No effect</sl-menu-item>
            ${this.responses.map(
              r => html`
                <sl-menu-item value=${r.id}>${r.fileName}</sl-menu-item>
              `
            )}
          </sl-select>
          <div class="normalize-setting">
            <sl-checkbox id="normalize-checkbox" checked>
              Normalize output: Sets the <code>convolver</code> attribute of the
              underlying <code>ConvolverNode</code>. Changing this will not
              affect the current playback.
              <a
                href="https://webaudio.github.io/web-audio-api/#dom-convolvernode-normalize"
                >See specification for details.</a
              >
            </sl-checkbox>
          </div>
          <ul class="playback-list">
            ${SAMPLE_FILES.map(this.renderSampleFile.bind(this))}
            ${this.customFiles.map(this.renderCustomFile.bind(this))}
          </ul>
        </section>
      </base-card>
    `;
  }

  private renderCustomFile({ fileName, buffer }: CustomFile) {
    const isCurrent = this.playback?.fileName === fileName;
    const isPlaying = isCurrent && this.playback?.isPlaying;

    let progress = 0;
    const duration = Math.floor(this.durations.get(fileName) || 0);
    if (duration && this.playback?.currentTime) {
      progress = (this.playback?.currentTime / duration) * 100;
    }

    return html`
      <li class="playback-list-entry">
        <sl-icon-button
          name=${isPlaying ? 'pause-fill' : 'play-fill'}
          @click=${() => this.onPlay(fileName)}
        ></sl-icon-button>
        <div>
          <p>${fileName}</p>
        </div>
        <p>
          <span>${duration} ${UNIT_SECONDS}</span>
        </p>
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

  private renderSampleFile({ label, fileName, credit }: SampleFile) {
    const isCurrent = this.playback?.fileName === fileName;
    const isPlaying = isCurrent && this.playback?.isPlaying;

    let progress = 0;
    const duration = Math.floor(this.durations.get(fileName) || 0);
    if (duration && this.playback?.currentTime) {
      progress = (this.playback?.currentTime / duration) * 100;
    }

    return html`
      <li class="playback-list-entry">
        <sl-icon-button
          name=${isPlaying ? 'pause-fill' : 'play-fill'}
          @click=${() => this.onPlay(fileName)}
        ></sl-icon-button>
        <div>
          <p>${label}</p>
          ${credit ? html`<small>${credit}</small>` : null}
        </div>
        <p>
          <span>${duration} ${UNIT_SECONDS}</span>
        </p>
        <audio
          src=${`/assets/sounds/${fileName}`}
          preload="metadata"
          style="display: none;"
          @durationchange=${(ev: Event) => {
            this.setDuration(
              fileName,
              (ev.target as HTMLAudioElement).duration
            );
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

  private async onFilesAdded({ detail: { files } }: FileDropChangeEvent) {
    for (let i = 0; i < files.length; i += 1) {
      const fileName = files[i].name;
      // eslint-disable-next-line no-await-in-loop
      const buffer = await readAudioFile(files[i]);
      this.setDuration(fileName, buffer.duration);
      this.customFiles.push({
        fileName,
        buffer,
      });
    }

    this.requestUpdate();
  }

  // eslint-disable-next-line class-methods-use-this
  private async onResponseSelected() {
    if (this.playback) {
      const shouldStartPlaying = this.playback.isPlaying;

      await this.createPlayback(
        this.playback.source
        // this.playback.currentTime,
      );

      if (shouldStartPlaying) {
        this.playback.play();
      }
    }
  }

  private togglePlayPause() {
    if (!this.playback) {
      throw new Error('[ConvolverCard] illegal state: no current playback');
    }

    this.playback.togglePlayPause();
  }

  // eslint-disable-next-line class-methods-use-this
  private async onPlay(fileName: string) {
    if (this.playback && this.playback.fileName === fileName) {
      this.togglePlayPause();
    } else {
      const source = new ConvolverStreamPlaybackSource(fileName);
      // new ConvolverBufferPlaybackSource(buffer) : 
      await this.createPlayback(source);
      this.playback?.play();
    }
  }

  private async createPlayback(
    // startTime: number | null = null,
    source: ConvolverPlaybackSource
  ) {
    await this.destroyCurrentPlayback();

    const response = this.getCurrentResponse();

    this.playback = new ConvolverPlayback({
      normalize: this.normalizeCheckboxEl.checked,
      response,
      startTime: 0
    }, source);
    this.playback.setOnUpdateListener(async () => {
      if (this.playback?.ended) {
        await this.destroyCurrentPlayback();
      }
      this.requestUpdate();
    });
  }

  private async destroyCurrentPlayback() {
    if (this.playback) {
      await this.playback.destroy();
      this.playback = null;
    }
  }

  private getSelectedResponseId() {
    const { value } = this.selectEl;
    return value instanceof Array ? value[0] : value;
  }

  private getCurrentResponse(): RoomResponse | null {
    const id = this.getSelectedResponseId();

    if (id === NO_EFFECT) {
      return null;
    }

    const response = this.responses.find(r => r.id === id);

    if (!response) {
      throw new Error(`[ConvolverCard] no response with id '${id}'`);
    }

    return response;
  }

  static styles = css`
    section {
      display: grid;
      gap: 1rem;
    }

    .normalize-setting {
      padding: 0.5rem;
    }

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
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 0 1rem;
      padding: 0.25rem 0.75rem;
    }

    li.playback-list-entry:not(:last-child) {
      border-bottom: 1px solid var(--sl-color-neutral-200);
    }

    li.playback-list-entry p {
      margin: 0;
    }

    .progress {
      grid-column: 1 / -1;
      height: 3px;
      margin: 0.25rem 0;
      border-radius: 1.5px;
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
