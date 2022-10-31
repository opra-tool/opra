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
import { BinauralAudio } from '../audio/BinauralAudio';

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

  render() {
    return html`
      <section>
        <header>
          <h1>RAQI Online Toolbox</h1>

          <file-drop @change=${this.onFileSelected}></file-drop>
        </header>
        ${this.renderAudioInfo()}
        ${this.isProcessing ? this.renderProgress() : this.renderResults()}
        ${this.renderExecutionTime()}
      </section>
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
    edtValues,
    reverbTime,
    c50Values,
    c80Values,
    strength,
    earlyStrength,
    lateStrength,
    squaredImpulseResponse,
    aWeightedC80,
    aWeightedStrength,
    bassRatio,
    centerTime,
    earlyBassStrength,
    trebleRatio,
  }: MonauralAnalyzeResults) {
    return html`
      <div class="graphs">
        <reverberation-graph
          .energyDecayCurve=${edtValues}
          .reverberationTime=${reverbTime}
        ></reverberation-graph>
        <c50c80-graph .c50=${c50Values} .c80=${c80Values}></c50c80-graph>
        <strength-graph
          .strength=${strength}
          .earlyStrength=${earlyStrength}
          .lateStrength=${lateStrength}
        ></strength-graph>
        <impulse-response-graph
          .squaredIR=${squaredImpulseResponse}
        ></impulse-response-graph>
      </div>
      <parameters-card
        .parameters=${[
          {
            name: 'Center Time',
            value: centerTime,
            unit: 'sec',
          },
          {
            name: 'Early Bass Strength',
            value: earlyBassStrength,
            unit: 'dB',
          },
          {
            name: 'Bass Ratio',
            value: bassRatio,
          },
          {
            name: 'Treble Ratio',
            value: trebleRatio,
          },
          {
            name: 'A-weighted Strength',
            unit: 'dB',
            value: aWeightedStrength,
          },
          {
            name: 'C80 A-weighted',
            unit: 'dB',
            value: aWeightedC80,
          },
        ]}
      ></parameters-card>
    `;
  }

  private clearState() {
    this.audioInfo = null;
    this.results = null;
    this.executionTimeMs = null;
  }

  private async analyzeFile(bytes: ArrayBuffer) {
    this.clearState();

    this.isProcessing = true;
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
          BinauralAudio.fromAudioBuffer(audioBuffer)
        ),
      };
    } else {
      // TODO: use proper error message
      // eslint-disable-next-line no-alert
      alert('only monaural or binaural audio is supported');
    }

    this.isProcessing = false;
    this.executionTimeMs = performance.now() - t0;
  }

  private onFileRead = (e: ProgressEvent<FileReader>) => {
    if (!e.target) {
      return;
    }

    const bytes = e.target.result;
    if (bytes === null || typeof bytes === 'string') {
      throw new Error('invalid data read from audio file');
    }

    // TODO: open modal
    // eslint-disable-next-line no-console
    this.analyzeFile(bytes).catch(console.error);
  };

  private onFileSelected = (ev: CustomEvent<{ file: File }>) => {
    const reader = new FileReader();
    reader.onload = this.onFileRead;
    reader.readAsArrayBuffer(ev.detail.file);
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

    parameters-card,
    execution-time {
      grid-column: 1 / -1;
    }

    .results {
      display: grid;
      gap: 1rem;
    }

    .graphs {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
    }
  `;
}
