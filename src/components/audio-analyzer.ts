import { LitElement, html, css } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { UNIT_CELCIUS } from '../units';
import { FileListToggleEvent, FileListRemoveEvent } from './file-list';
import { RoomResponse } from '../audio/room-response';
import { BinauralResults, processBinauralAudio } from '../binaural-processing';
import { MonauralResults, processMonauralAudio } from '../monaural-processing';
import { binauralAudioFromBuffer } from '../audio/binaural-samples';
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
import { meanDecibel } from '../math/decibels';

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
        // this.results.set(response.id, results);
        this.responses.push(response);
        this.analyzeResponse(response);
      }

      this.requestUpdate();
    });
  }

  render() {
    const fileListEntries = this.responses.map(
      ({ type, id, color, duration, isEnabled, sampleRate, fileName }) => ({
        type,
        id,
        color,
        duration,
        isEnabled,
        sampleRate,
        fileName,
        hasResults: this.results.has(id),
      })
    );

    return html`
      <section class="grid">
        <base-card class="controls-card">
          <section class="files">
            <file-drop
              label="Drop room response files here"
              @change=${this.onFilesAdded}
            ></file-drop>
            ${this.responses.length > 0
              ? html`
                  <file-list
                    .entries=${fileListEntries}
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
        ${this.renderResults()}
        <error-details .error=${this.error}></error-details>
      </section>

      ${this.responses.length > 0
        ? html`<file-dropdown
            .entries=${fileListEntries}
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

  private renderResults() {
    if (!this.responses.length) {
      return null;
    }

    const responses = this.responses.filter(
      r => r.isEnabled && this.results.has(r.id)
    );

    if (!responses.length) {
      return html`<progress-indicator></progress-indicator>`;
    }

    const includesBinauralResponses = responses.some(
      ({ type }) => type === 'binaural'
    );

    const responseDetails = responses.map(({ color, fileName }) => ({
      color,
      fileName,
    }));

    // monaural parameters
    const results = responses.map(this.getResponseResultsOrThrow.bind(this));
    const edt = mapArrayParam(results, 'edtBands');
    const reverbTime = mapArrayParam(results, 'reverbTimeBands');
    const c50 = mapArrayParam(results, 'c50Bands');
    const c80 = mapArrayParam(results, 'c80Bands');
    const squaredIRPoints = mapArrayParam(results, 'squaredIRPoints');
    const centreTimes = mapArrayParam(results, 'centreTime');
    const bassRatios = mapArrayParam(results, 'bassRatio');
    const meanC80s = c80.map(value => meanDecibel(value[3], value[4]));
    const meanReverbTimes = reverbTime.map(value => (value[3] + value[4]) / 2);

    // binaural parameters
    const binauralResults = results.filter(isBinauralResults);
    const iaccs = results.map(r => {
      if (isBinauralResults(r)) {
        return r.iacc;
      }

      return null;
    });
    const iaccBands = mapArrayParam(binauralResults, 'iaccBands');
    const eiaccBands = mapArrayParam(binauralResults, 'eiaccBands');

    const strengths = responses.map(
      r => this.strengthResults.get(r.id) || null
    );

    return html`
      ${includesBinauralResponses
        ? html`<binaural-note-card></binaural-note-card>`
        : null}
      <impulse-response-graph
        .responseDetails=${responseDetails}
        .squaredIRPoints=${squaredIRPoints}
      ></impulse-response-graph>

      <parameters-card
        .responseDetails=${responseDetails}
        .centreTimes=${centreTimes}
        .bassRatios=${bassRatios}
        .c80s=${meanC80s}
        .reverbTimes=${meanReverbTimes}
        .iaccs=${iaccs}
        .strengths=${strengths}
      >
        <p0-notice
          .p0=${this.p0}
          .temperature=${this.temperature}
          .relativeHumidity=${this.relativeHumidity}
          @show-p0-dialog=${this.onShowP0Dialog}
        ></p0-notice>
      </parameters-card>

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

      ${binauralResults.length
        ? html`<iacc-graph
            .responseDetails=${responseDetails}
            .iacc=${iaccBands}
            .eiacc=${eiaccBands}
          ></iacc-graph>`
        : null}

      <convolver-card
        class=${classMap({ expand: binauralResults.length })}
        .responses=${responses}
      ></convolver-card>
    `;
  }

  private getResponseResultsOrThrow({ id }: { id: string }): Results {
    const maybeResults = this.results.get(id);

    if (!maybeResults) {
      throw new Error(`expected results to be defined for id ${id}`);
    }

    return maybeResults;
  }

  private async analyzeResponse({ id, sampleRate, buffer }: RoomResponse) {
    try {
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

      this.results.set(id, results);

      if (this.p0 !== null) {
        this.strengthResults.set(
          id,
          await calculateStrengths(results, {
            p0: this.p0,
            relativeHumidity: this.relativeHumidity,
            temperature: this.temperature,
          })
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      if (err instanceof Error) {
        this.error = err;
      }
    }

    this.requestUpdate();
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

  private async addFiles(files: FileList) {
    for (let i = 0; i < files.length; i += 1) {
      if (this.responses.length >= MAX_FILE_COUNT) {
        toastWarning(
          `Maximum file count (${MAX_FILE_COUNT}) reached. Skipping ${
            files.length - MAX_FILE_COUNT
          } files.`
        );
        break;
      }

      try {
        // eslint-disable-next-line no-await-in-loop
        const response = await this.parseFile(files[i]);
        this.responses.push(response);

        this.analyzeResponse(response);

        // eslint-disable-next-line no-await-in-loop
        await persistResponse(response);
      } catch (err) {
        let message = 'unknown error';
        if (err instanceof Error) {
          message = err.message;
        }
        toastWarning(`Skipping file ${files[i].name}: ${message}`);
      }
    }

    this.requestUpdate();
  }

  private async parseFile(file: File): Promise<RoomResponse> {
    const buffer = await readAudioFile(file);

    if (buffer.numberOfChannels < 1 || buffer.numberOfChannels > 2) {
      throw new Error(`unsupported channel count: ${buffer.numberOfChannels}`);
    }

    return {
      type: buffer.numberOfChannels === 1 ? 'monaural' : 'binaural',
      id: AudioAnalyzer.randomId(),
      fileName: file.name,
      buffer,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
      isEnabled: true,
      color: this.findAvailableColor(),
    };
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
    this.addFiles(ev.detail.files);
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
    .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
      margin-block-end: 2.5rem;
    }

    .grid > * {
      /* prevent stretching of parent */
      min-width: 0;
    }

    section.files {
      display: grid;
      grid-template-rows: auto;
      gap: 1rem;
    }

    @media screen and (min-width: 40rem) {
      section.files {
        grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr));
      }
    }

    section.settings {
      margin-block-start: 1rem;
    }

    .controls-card,
    binaural-note-card,
    impulse-response-graph,
    parameters-card {
      grid-column: 1 / -1;
    }

    /* allow stretching to full width if on its own row */
    convolver-card.expand {
      grid-column: 1 / -1;
    }
  `;
}
