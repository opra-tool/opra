import { LitElement, html, css } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { UNIT_CELCIUS } from '../units';
import { FileListToggleEvent, FileListRemoveEvent } from './file-list';
import { RoomResponse } from '../audio/room-response';
import { BinauralResults, processBinauralAudio } from '../binaural-processing';
import { MonauralResults, processMonauralAudio } from '../monaural-processing';
import { binauralAudioFromBuffer } from '../audio/binaural-audio';
import { FileDropChangeEvent } from './file-drop';
import { readAudioFile } from '../audio/audio-file-reading';
import { P0SettingChangeEvent } from './p0-setting';
import { calculateStrengths, Strengths } from '../strength';
import { P0Dialog, P0DialogChangeEvent } from './p0-dialog';
import { mapArrayParam } from '../arrays';
import { toastSuccess, toastWarning } from './toast';
import { P0_VAR } from '../presentation/p0-format';
import {
  getResponses,
  persistResponse,
  persistValue,
  removeResponse,
  retrieveValue,
  retrieveValueOrDefault,
} from '../persistence';

const COLOR_WHITE = 'rgba(255, 255, 255, 0.75)';
const COLOR_BLUE = 'rgba(153, 102, 255, 0.5)';
const COLOR_RED = 'rgba(255, 99, 132, 0.5)';
const COLOR_YELLOW = 'rgba(128, 128, 0, 0.5)';
const COLOR_GREEN = 'rgba(93, 163, 153, 0.5)';

const FILE_COLORS = [
  COLOR_WHITE,
  COLOR_BLUE,
  COLOR_RED,
  COLOR_YELLOW,
  COLOR_GREEN,
];

const MAX_FILE_COUNT = FILE_COLORS.length;

type Results = MonauralResults | BinauralResults;

function isBinauralResults(results: Results): results is BinauralResults {
  return (results as BinauralResults).iaccBands !== undefined;
}

const P0_STORAGE_KEY = 'strengths-p0';
const TEMPERATURE_STORAGE_KEY = 'strengths-temperature';
const HUMIDITY_STORAGE_KEY = 'strengths-humidity';

const DEFAULT_RELATIVE_HUMIDITY = 50;
const DEFAULT_TEMPERATURE = 20;

@customElement('audio-analyzer')
export class AudioAnalyzer extends LitElement {
  @state()
  private p0 = retrieveValue(P0_STORAGE_KEY);

  @state()
  private temperature = retrieveValueOrDefault(
    TEMPERATURE_STORAGE_KEY,
    DEFAULT_TEMPERATURE
  );

  @state()
  private relativeHumidity = retrieveValueOrDefault(
    HUMIDITY_STORAGE_KEY,
    DEFAULT_RELATIVE_HUMIDITY
  );

  @state()
  private responses: RoomResponse[] = [];

  @state()
  private results: Map<string, Results> = new Map();

  @state()
  private strengthResults: Map<string, Strengths> = new Map();

  @state()
  private error: Error | null = null;

  @query('.p0-dialog', true)
  private p0Dialog!: P0Dialog;

  protected firstUpdated() {
    getResponses().then(responses => {
      for (const response of responses) {
        this.results.set(response.id, response.results);
      }

      this.responses = responses.map(r => ({
        ...r,
        isProcessing: false,
      }));

      if (this.p0 !== null) {
        this.recalculateStrengths();
      }
    });
  }

  render() {
    const isProcessing = this.responses.length
      ? this.responses.every(file => file.isProcessing)
      : false;

    return html`
      <section class="audio-analyzer">
        <base-card class="controls-card">
          <section class="files">
            <file-drop @change=${this.onFilesAdded}></file-drop>
            ${this.responses.length > 0
              ? html`
                  <file-list
                    .files=${this.responses}
                    @toggle-file=${this.onToggleFile}
                    @remove-file=${this.onRemoveFile}
                  ></file-list>
                `
              : null}
          </section>
          <section class="settings">
            <p0-setting
              .p0=${this.p0}
              @change=${this.onP0SettingChange}
            ></p0-setting>
          </section>
        </base-card>
        ${isProcessing ? this.renderProgress() : this.renderResults()}
        ${this.renderError()}
      </section>

      ${this.responses.length > 0
        ? html`<file-dropdown
            .files=${this.responses}
            @toggle-file=${this.onToggleFile}
            @remove-file=${this.onRemoveFile}
          ></file-dropdown>`
        : null}

      <p0-dialog
        .p0=${this.p0}
        relativeHumidity=${this.relativeHumidity}
        temperature=${this.temperature}
        class="p0-dialog"
        @change=${this.onP0DialogChange}
      ></p0-dialog>
    `;
  }

  private renderError() {
    if (!this.error) {
      return null;
    }

    return html`
      <div class="error">
        <sl-icon name="exclamation-octagon"></sl-icon>
        <strong>An error occured</strong>
        <sl-details summary="Technical details">
          <code> ${this.error} </code>
        </sl-details>
      </div>
    `;
  }

  // eslint-disable-next-line class-methods-use-this
  private renderProgress() {
    return html`<progress-indicator></progress-indicator>`;
  }

  private renderResults() {
    if (!this.results.size) {
      return null;
    }

    const enabledResponses = this.responses.filter(
      f => !f.isProcessing && f.isEnabled
    );

    const responseDetails = enabledResponses.map(({ color, fileName }) => ({
      color,
      fileName,
    }));

    // monaural parameters
    const results = enabledResponses.map(
      this.getResponseResultsOrThrow.bind(this)
    );
    const edt = mapArrayParam(results, 'edtBands');
    const reverbTime = mapArrayParam(results, 'reverbTimeBands');
    const c50 = mapArrayParam(results, 'c50Bands');
    const c80 = mapArrayParam(results, 'c80Bands');
    const squaredIR = mapArrayParam(results, 'squaredImpulseResponse');
    const schwerpunktzeiten = mapArrayParam(results, 'schwerpunktzeit');
    const bassRatios = mapArrayParam(results, 'bassRatio');

    // binaural parameters
    const binauralResults = results.filter(isBinauralResults);
    const iacc = mapArrayParam(binauralResults, 'iaccBands');
    const eiacc = mapArrayParam(binauralResults, 'eiaccBands');

    const strengths = enabledResponses.map(
      this.getResponseStrengthResults.bind(this)
    );

    return html`
      <section class="results">
        <impulse-response-graph
          .responseDetails=${responseDetails}
          .squaredIR=${squaredIR}
        ></impulse-response-graph>
        <parameters-card
          .responseDetails=${responseDetails}
          .schwerpunktzeiten=${schwerpunktzeiten}
          .bassRatios=${bassRatios}
          .strengths=${strengths}
        >
          <p0-notice
            .p0=${this.p0}
            .temperature=${this.temperature}
            .relativeHumidity=${this.relativeHumidity}
            @show-p0-dialog=${this.onShowP0Dialog}
          ></p0-notice>
        </parameters-card>
        ${binauralResults.length
          ? html` <iacc-graph
              .responseDetails=${responseDetails}
              .iacc=${iacc}
              .eiacc=${eiacc}
            ></iacc-graph>`
          : null}
        <div class="grid">
          <reverb-graph
            .responseDetails=${responseDetails}
            .edt=${edt}
            .reverbTime=${reverbTime}
          ></reverb-graph>
          <c50c80-graph
            .responseDetails=${responseDetails}
            .c50=${c50}
            .c80=${c80}
          ></c50c80-graph>
        </div>
        <strengths-card
          .p0=${this.p0}
          .responseDetails=${responseDetails}
          .strengths=${strengths}
        >
          <p0-notice
            slot="p0-notice"
            .p0=${this.p0}
            .temperature=${this.temperature}
            .relativeHumidity=${this.relativeHumidity}
            @show-p0-dialog=${this.onShowP0Dialog}
          ></p0-notice>
          <p0-setting
            slot="p0-setting"
            .p0=${this.p0}
            @change=${this.onP0SettingChange}
          ></p0-setting>
        </strengths-card>
      </section>
    `;
  }

  private getResponseResultsOrThrow({ id }: { id: string }): Results {
    const maybeResults = this.results.get(id);

    if (!maybeResults) {
      throw new Error(`expected results to be defined for id ${id}`);
    }

    return maybeResults;
  }

  private getResponseStrengthResults({ id }: { id: string }): Strengths | null {
    return this.strengthResults.get(id) || null;
  }

  private async analyzeFile(audioFile: File) {
    if (this.responses.length >= MAX_FILE_COUNT) {
      toastWarning(
        `Maximum file count (${MAX_FILE_COUNT}) reached. Skipping file ${audioFile.name}.`
      );
      return;
    }

    const buffer = await readAudioFile(audioFile);

    if (buffer.numberOfChannels < 1 || buffer.numberOfChannels > 2) {
      toastWarning(
        `Skipping file ${audioFile.name} due to unsupported channel count (${buffer.numberOfChannels}).`
      );
      return;
    }

    const response: RoomResponse = {
      type: buffer.numberOfChannels === 1 ? 'monaural' : 'binaural',
      id: AudioAnalyzer.randomId(),
      fileName: audioFile.name,
      durationSeconds: buffer.duration,
      sampleRate: buffer.sampleRate,
      isProcessing: true,
      isEnabled: true,
      color: this.findAvailableColor(),
    };

    this.responses = [...this.responses, response];

    const { sampleRate } = buffer;

    let results;
    if (buffer.numberOfChannels === 1) {
      results = await processMonauralAudio(
        buffer.getChannelData(0),
        sampleRate
      );
    } else {
      results = await processBinauralAudio(
        binauralAudioFromBuffer(buffer),
        sampleRate
      );
    }

    this.results.set(response.id, results);

    await persistResponse({
      ...response,
      results,
    });

    if (this.p0 !== null) {
      this.strengthResults.set(
        response.id,
        await calculateStrengths(results, {
          p0: this.p0,
          relativeHumidity: this.relativeHumidity,
          temperature: this.temperature,
        })
      );
    }

    this.responses = this.responses.map(r => ({
      ...r,
      isProcessing: r.id === response.id ? false : r.isProcessing,
    }));
  }

  private findAvailableColor(): string {
    const takenColors = this.responses.map(r => r.color);
    const color = FILE_COLORS.find(c => !takenColors.includes(c));

    if (!color) {
      throw new Error(
        `could not find available color takenColors=${takenColors}`
      );
    }

    return color;
  }

  private async recalculateStrengths() {
    if (!this.p0) {
      throw new Error('expected p0 to be defined when recalcuation strengths');
    }

    for (const response of this.responses) {
      const results = this.getResponseResultsOrThrow(response);

      this.strengthResults.set(
        response.id,
        // eslint-disable-next-line no-await-in-loop
        await calculateStrengths(results, {
          p0: this.p0,
          relativeHumidity: this.relativeHumidity,
          temperature: this.temperature,
        })
      );
    }

    this.requestUpdate();
  }

  private async analyzeFiles(files: FileList) {
    for (let i = 0; i < files.length; i += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.analyzeFile(files[i]);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);

        if (err instanceof Error) {
          this.error = err;
        } else if (typeof err === 'string') {
          this.error = new Error(err);
        }
      }
    }
  }

  private onP0SettingChange({ detail: { p0 } }: P0SettingChangeEvent) {
    this.p0 = p0;

    setTimeout(() => {
      toastSuccess(html`Successfully set ${P0_VAR} = ${p0}`);

      this.recalculateStrengths();

      persistValue(P0_STORAGE_KEY, p0);
    }, 0);
  }

  private onP0DialogChange({
    detail: { p0, relativeHumidity, temperature },
  }: P0DialogChangeEvent) {
    this.p0 = p0;
    this.relativeHumidity = relativeHumidity;
    this.temperature = temperature;

    setTimeout(() => {
      this.p0Dialog.hide();
      toastSuccess(
        html`Successfully set ${P0_VAR} = ${p0}, ${temperature}${UNIT_CELCIUS},
        ${relativeHumidity}%`
      );

      this.recalculateStrengths();

      persistValue(P0_STORAGE_KEY, p0);
      persistValue(TEMPERATURE_STORAGE_KEY, this.temperature);
      persistValue(HUMIDITY_STORAGE_KEY, this.relativeHumidity);
    }, 0);
  }

  private onShowP0Dialog() {
    this.p0Dialog.show();
  }

  private onRemoveFile(ev: FileListRemoveEvent) {
    this.responses = this.responses.filter(el => el.id !== ev.detail.id);
    this.results.delete(ev.detail.id);
    // eslint-disable-next-line no-console
    removeResponse(ev.detail.id).catch(console.error);
  }

  private onToggleFile(ev: FileListToggleEvent) {
    this.responses = this.responses.map(el => ({
      ...el,
      isEnabled: el.id === ev.detail.id ? !el.isEnabled : el.isEnabled,
    }));
  }

  private onFilesAdded(ev: FileDropChangeEvent) {
    this.analyzeFiles(ev.detail.files);
  }

  /**
   * @copyright Michal Zalecki
   * @returns A pseudo-random ID
   */
  static randomId(): string {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(8);
  }

  static styles = css`
    section.audio-analyzer {
      display: grid;
      gap: 1rem;
      margin-block-end: 2.5rem;
    }

    section.files {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr));
      gap: 1rem;
    }

    section.settings {
      margin-block-start: 1rem;
    }

    section.results {
      display: grid;
      gap: 1rem;
    }

    section.results > * {
      /* prevent stretching of parent */
      min-width: 0;
    }

    .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
    }

    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 10vh 2rem 2rem 2rem;
      color: var(--sl-color-danger-300);
    }

    .error sl-icon {
      font-size: 4rem;
    }
  `;
}
