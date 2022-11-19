import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { FileListToggleEvent, FileListRemoveEvent } from './FileList';
import { RoomImpulseFile } from '../audio/RoomImpulseFile';
import {
  BinauralResults,
  processBinauralAudio,
} from '../binauralAudioProcessing';
import {
  MonauralResults,
  processMonauralAudio,
} from '../monauralAudioProcessing';
import { binauralAudioFromBuffer } from '../audio/BinauralAudio';
import { Parameter } from './ParametersTable';
import { UNIT_MILLISECONDS } from '../units';
import { FileDropChangeEvent } from './FileDrop';
import { readAudioFile } from '../audio/readAudioFile';

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

type Results = MonauralResults | BinauralResults;

type AssociatedMonauralResults = MonauralResults & {
  fileName: string;
  color: string;
};
type AssociatedBinauralResults = BinauralResults & {
  fileName: string;
  color: string;
};

type AssociatedResults = AssociatedMonauralResults | AssociatedBinauralResults;

function isAssociatedBinauralResults(
  results: AssociatedResults
): results is AssociatedBinauralResults {
  return (results as AssociatedBinauralResults).iacc !== undefined;
}

/**
 * @copyright Michal Zalecki
 * @returns A pseudo-random ID
 */
function randomId(): string {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(8);
}

@customElement('audio-analyzer')
export class AudioAnalyzer extends LitElement {
  @state()
  private responses: RoomImpulseFile[] = [];

  @state()
  private results: Map<string, Results> = new Map();

  @state()
  private error: Error | null = null;

  render() {
    const isProcessing = this.responses.length
      ? this.responses.every(file => file.isProcessing)
      : false;

    return html`
      <section class="audio-analyzer">
        <base-card>
          <section class="input">
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
        </base-card>
        ${isProcessing ? this.renderProgress() : this.renderResults()}
        ${this.renderError()}
      </section>
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
        ${this.error.message}
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

    const enabledFiles = this.responses.filter(
      f => !f.isProcessing && f.isEnabled
    );

    const results = enabledFiles.map(({ id, fileName: name, color }) => {
      const maybeResults = this.results.get(id);

      if (!maybeResults) {
        throw new Error('expected results to be defined');
      }

      return {
        fileName: name,
        color,
        ...maybeResults,
      };
    });

    const binauralResults = results.filter(isAssociatedBinauralResults);

    const iacc = binauralResults.map(
      ({ fileName, color, iacc: bandValues }) => ({
        fileName,
        color,
        bandValues,
      })
    );
    const eiacc = binauralResults.map(
      ({ fileName, color, eiacc: bandValues }) => ({
        fileName,
        color,
        bandValues,
      })
    );

    const edt = results.map(({ fileName, color, edtValues: bandValues }) => ({
      fileName,
      color,
      bandValues,
    }));
    const reverbTime = results.map(
      ({ fileName, color, reverbTime: bandValues }) => ({
        fileName,
        color,
        bandValues,
      })
    );

    const c50 = results.map(({ fileName, color, c50Values: bandValues }) => ({
      fileName,
      color,
      bandValues,
    }));
    const c80 = results.map(({ fileName, color, c80Values: bandValues }) => ({
      fileName,
      color,
      bandValues,
    }));

    const squaredIR = results.map(
      ({ fileName, color, squaredImpulseResponse: points }) => ({
        fileName,
        color,
        points,
      })
    );

    const strengthInputs = results.map(
      ({
        fileName,
        color,
        bandsSquaredSum,
        e80BandsSquaredSum,
        l80BandsSquaredSum,
        aWeightedSquaredSum,
        c80Values,
      }) => ({
        fileName,
        color,
        bandsSquaredSum,
        e80BandsSquaredSum,
        l80BandsSquaredSum,
        aWeightedSquaredSum,
        c80Bands: c80Values,
      })
    );

    const parameters: Parameter[] = [
      {
        name: 'Center Time',
        unit: UNIT_MILLISECONDS,
        responseValues: results.map(
          ({ fileName, color, centerTime: value }) => ({
            fileName,
            color,
            value,
          })
        ),
      },
      {
        name: 'Bass Ratio',
        responseValues: results.map(
          ({ fileName, color, bassRatio: value }) => ({
            fileName,
            color,
            value,
          })
        ),
      },
    ];

    return html`
      <section class="results">
        <impulse-response-graph
          .squaredIR=${squaredIR}
        ></impulse-response-graph>
        ${binauralResults.length
          ? html`<iacc-graph .iacc=${iacc} .eiacc=${eiacc}></iacc-graph>`
          : null}
        <parameters-card .parameters=${parameters}></parameters-card>
        <div class="grid">
          <reverb-graph .edt=${edt} .reverbTime=${reverbTime}></reverb-graph>
          <c50c80-graph .c50=${c50} .c80=${c80}></c50c80-graph>
        </div>
        <strengths-card .inputs=${strengthInputs}></strengths-card>
      </section>
    `;
  }

  private async analyzeFile(audioFile: File) {
    const audioBuffer = await readAudioFile(audioFile);

    const id = randomId();

    this.responses = [
      ...this.responses,
      {
        id,
        fileName: audioFile.name,
        channelCount: audioBuffer.numberOfChannels,
        durationSeconds: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        isProcessing: true,
        isEnabled: true,
        color: FILE_COLORS[this.responses.length],
      },
    ];

    if (audioBuffer.numberOfChannels === 1) {
      this.results.set(
        id,
        await processMonauralAudio(
          audioBuffer.getChannelData(0),
          audioBuffer.sampleRate
        )
      );
    } else if (audioBuffer.numberOfChannels === 2) {
      this.results.set(
        id,
        await processBinauralAudio(
          binauralAudioFromBuffer(audioBuffer),
          audioBuffer.sampleRate
        )
      );
    } else {
      throw new Error('only monaural or binaural audio is supported');
    }

    this.responses = this.responses.map(file => ({
      ...file,
      isProcessing: file.id === id ? false : file.isProcessing,
    }));
  }

  private async analyzeFiles(files: FileList) {
    for (let i = 0; i < files.length; i += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.analyzeFile(files[i]);
      } catch (err) {
        if (err instanceof Error) {
          this.error = err;
        } else if (typeof err === 'string') {
          this.error = new Error(err);
        }
      }
    }
  }

  private onRemoveFile(ev: FileListRemoveEvent) {
    this.responses = this.responses.filter(el => el.id !== ev.detail.id);
    this.results.delete(ev.detail.id);
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

  static styles = css`
    section.audio-analyzer {
      display: grid;
      gap: 1rem;
    }

    section.input {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr));
      gap: 1rem;
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
