import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  BinauralAnalyzeResults,
  processBinauralAudio,
} from '../binauralAudioProcessing';
import { parseSampleRate } from '../audio/parseSampleRate';
import {
  MonauralAnalyzeResults,
  processMonauralAudio,
} from '../monauralAudioProcessing';
import { binauralAudioFromBuffer } from '../audio/BinauralAudio';
import { Parameter } from './ParametersTable';
import { UNIT_MILLISECONDS } from '../units';
import { FileDropChangeEvent } from './FileDrop';
import { readAudioFile } from '../audio/readAudioFile';

type AudioInfo = {
  fileName: string;
  channelCount: number;
  durationSeconds: number;
  sampleRate: number;
};

type Results =
  | {
      type: 'monaural';
      values: MonauralAnalyzeResults;
    }
  | {
      type: 'binaural';
      values: BinauralAnalyzeResults;
    };

@customElement('audio-analyzer')
export class AudioAnalyzer extends LitElement {
  @state()
  private isProcessing: boolean = false;

  @state()
  private executionTimeMs: number | null = null;

  @state()
  private results: Results | null = null;

  @state()
  private audioInfo: AudioInfo | null = null;

  @state()
  private error: Error | null = null;

  render() {
    return html`
      <section>
        <file-drop @change=${this.onFileDropChanged}></file-drop>
        ${this.renderAudioInfo()}
        ${this.isProcessing ? this.renderProgress() : this.renderResults()}
        ${this.renderExecutionTime()} ${this.renderError()}
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

  private renderExecutionTime() {
    if (!this.executionTimeMs) {
      return null;
    }

    return html`
      <execution-time .milliseconds=${this.executionTimeMs}></execution-time>
    `;
  }

  private renderAudioInfo() {
    if (!this.audioInfo) {
      return null;
    }

    return html`
      <audio-info-card
        .fileName=${this.audioInfo.fileName}
        .channelCount=${this.audioInfo.channelCount}
        .durationSeconds=${this.audioInfo.durationSeconds}
        .sampleRate=${this.audioInfo.sampleRate}
      ></audio-info-card>
    `;
  }

  private renderResults() {
    if (!this.results) {
      return null;
    }

    return html`
      <div class="results">
        ${this.results.type === 'monaural'
          ? AudioAnalyzer.renderMonauralResults(this.results.values)
          : AudioAnalyzer.renderBinauralResults(this.results.values)}
      </div>
    `;
  }

  private static renderBinauralResults({
    iacc,
    eiacc,
    ...monauralMeans
  }: BinauralAnalyzeResults) {
    return html`
      <iacc-graph .iacc=${iacc} .eiacc=${eiacc}></iacc-graph>
      <base-card>
        <p>
          The following values and graphs are calculated by taking the
          arithmetic mean of separate calculations for the left and right
          channel. Keep in mind that the head-related transfer function might
          influence these results.
        </p>
      </base-card>
      ${this.renderMonauralResults(monauralMeans)}
    `;
  }

  private static renderMonauralResults({
    bandsSquaredSum,
    e80BandsSquaredSum,
    l80BandsSquaredSum,
    aWeightedSquaredSum,
    edtValues,
    reverbTime,
    c50Values,
    c80Values,
    bassRatio,
    centerTime,
    squaredImpulseResponse,
  }: MonauralAnalyzeResults) {
    const parameters: Parameter[] = [
      {
        name: 'Center Time',
        unit: UNIT_MILLISECONDS,
        value: centerTime,
      },
      {
        name: 'Bass Ratio',
        value: bassRatio,
      },
    ];

    return html`
      <div class="grid">
        <parameters-card .parameters=${parameters}></parameters-card>
        <impulse-response-graph
          .squaredIR=${squaredImpulseResponse}
        ></impulse-response-graph>
        <reverberation-graph
          .energyDecayCurve=${edtValues}
          .reverberationTime=${reverbTime}
        ></reverberation-graph>
        <c50c80-graph .c50=${c50Values} .c80=${c80Values}></c50c80-graph>
      </div>
      <strengths-card
        .bandsSquaredSum=${bandsSquaredSum}
        .e80BandsSquaredSum=${e80BandsSquaredSum}
        .l80BandsSquaredSum=${l80BandsSquaredSum}
        .aWeightedSquaredSum=${aWeightedSquaredSum}
        .c80Values=${c80Values}
      ></strengths-card>
    `;
  }

  private clearState() {
    this.error = null;
    this.audioInfo = null;
    this.results = null;
    this.executionTimeMs = null;
  }

  private async analyzeFile(audioFile: File) {
    const t0 = performance.now();

    const audioBuffer = await readAudioFile(audioFile);

    this.audioInfo = {
      fileName: audioFile.name,
      channelCount: audioBuffer.numberOfChannels,
      durationSeconds: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
    };

    if (audioBuffer.numberOfChannels === 1) {
      this.results = {
        type: 'monaural',
        values: await processMonauralAudio(
          audioBuffer.getChannelData(0),
          audioBuffer.sampleRate
        ),
      };
    } else if (audioBuffer.numberOfChannels === 2) {
      this.results = {
        type: 'binaural',
        values: await processBinauralAudio(
          binauralAudioFromBuffer(audioBuffer),
          audioBuffer.sampleRate
        ),
      };
    } else {
      throw new Error('only monaural or binaural audio is supported');
    }

    this.executionTimeMs = performance.now() - t0;
  }

  private async analyzeFiles(files: FileList) {
    this.clearState();

    this.isProcessing = true;

    this.analyzeFile(files[0])
      .catch(err => {
        if (err instanceof Error) {
          this.error = err;
        } else if (typeof err === 'string') {
          this.error = new Error(err);
        }
      })
      .finally(() => {
        this.isProcessing = false;
      });
  }

  private onFileDropChanged(ev: FileDropChangeEvent) {
    this.analyzeFiles(ev.detail.files);
  }

  static styles = css`
    section {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      margin: 0 auto;
      max-width: 1400px;
    }

    header h1 {
      font-size: 1.4rem;
      text-transform: uppercase;
    }

    impulse-response-graph,
    parameters-card,
    execution-time {
      grid-column: 1 / -1;
    }

    .results {
      display: grid;
      gap: 1rem;
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
