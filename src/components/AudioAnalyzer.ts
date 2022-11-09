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
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { Parameter } from './ParametersTable';
import { UNIT_SECONDS } from '../units';

type AudioInfo = {
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

  @state()
  private fileName: string | null = null;

  render() {
    return html`
      <section>
        <file-drop @change=${this.onFileSelected}></file-drop>
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
        .fileName=${this.fileName || ''}
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
  }: BinauralAnalyzeResults) {
    return html` <iacc-graph .iacc=${iacc} .eiacc=${eiacc}></iacc-graph> `;
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
        unit: UNIT_SECONDS, // TODO: use ms?
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
    this.fileName = null;
  }

  private async calculateResults(bytes: ArrayBuffer) {
    const t0 = performance.now();

    const sampleRate = parseSampleRate('wav', bytes);
    const audioCtx = new AudioContext({ sampleRate });
    const audioBuffer = await audioCtx.decodeAudioData(bytes);

    this.audioInfo = {
      channelCount: audioBuffer.numberOfChannels,
      durationSeconds: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
    };

    if (audioBuffer.numberOfChannels === 1) {
      const audio = new Float64Array(audioBuffer.getChannelData(0));

      this.results = {
        type: 'monaural',
        values: await processMonauralAudio(audio, audioBuffer.sampleRate),
      };
    } else if (audioBuffer.numberOfChannels === 2) {
      this.results = {
        type: 'binaural',
        values: await processBinauralAudio(
          binauralAudioFromBuffer(audioBuffer)
        ),
      };
    } else {
      throw new Error('only monaural or binaural audio is supported');
    }

    this.executionTimeMs = performance.now() - t0;
  }

  private async analyzeFile(bytes: ArrayBuffer) {
    this.clearState();

    this.isProcessing = true;

    this.calculateResults(bytes).catch(err => {
      if (err instanceof Error) {
        this.error = err;
      } else if (typeof err === 'string') {
        this.error = new Error(err);
      }
    });

    this.isProcessing = false;
  }

  private onFileRead = (ev: ProgressEvent<FileReader>) => {
    if (!ev.target) {
      return;
    }

    const bytes = ev.target.result;
    if (bytes === null || typeof bytes === 'string') {
      throw new Error('invalid data read from audio file');
    }

    this.analyzeFile(bytes);
  };

  private onFileSelected = (ev: CustomEvent<{ file: File }>) => {
    const reader = new FileReader();
    reader.onload = this.onFileRead;
    reader.readAsArrayBuffer(ev.detail.file);
    this.fileName = ev.detail.file.name;
  };

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
