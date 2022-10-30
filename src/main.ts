import { Chart, registerables } from 'chart.js';
import initWasm from 'wasm-raqi-online-toolbox';
import { BinauralAudio } from './audio/BinauralAudio';
import { parseSampleRate } from './audio/parseSampleRate';
import { processBinauralAudio } from './binauralAudioProcessing';
import { AudioInfoCard } from './components/AudioInfoCard';
import { BaseCard } from './components/BaseCard';
import { ExecutionTime } from './components/ExecutionTime';
import { FileDrop } from './components/FileDrop';
import { GraphCard } from './components/GraphCard';
import { ParametersCard } from './components/ParametersCard';
import { ProgressIndicator } from './components/ProgressIndicator';
import { requireElement } from './dom/requireElement';
import { createC50C80Graph } from './graphs/c50c80Graph';
import { createInterauralCrossCorrelationGraph } from './graphs/interauralCrossCorrelationGraph';
import { createReverberationGraph } from './graphs/reverberation';
import { createSquaredImpulseResponseGraph } from './graphs/squaredImpulseResponse';
import { createStrengthGraph } from './graphs/strengthGraph';
import { processMonauralAudio } from './monauralAudioProcessing';

// init web assembly module
// eslint-disable-next-line no-console
initWasm().catch(console.error);

// register web components
declare global {
  interface HTMLElementTagNameMap {
    'audio-info-card': AudioInfoCard;
    'base-card': BaseCard;
    'execution-time': ExecutionTime;
    'file-drop': FileDrop;
    'graph-card': GraphCard;
    'parameters-card': ParametersCard;
    'progress-indicator': ProgressIndicator;
  }
}

customElements.define('audio-info-card', AudioInfoCard);
customElements.define('base-card', BaseCard);
customElements.define('execution-time', ExecutionTime);
customElements.define('file-drop', FileDrop);
customElements.define('graph-card', GraphCard);
customElements.define('parameters-card', ParametersCard);
customElements.define('progress-indicator', ProgressIndicator);

// prepare chart.js library
// TODO: only register components actually in use to reduce bundle size
Chart.register(...registerables);

const fileDrop = requireElement<FileDrop>('file-drop');
const graphContainer = requireElement('graph-container');

async function processFile(e: ProgressEvent<FileReader>) {
  if (!e.target) {
    return;
  }

  const bytes = e.target.result;
  if (bytes === null || typeof bytes === 'string') {
    throw new Error('invalid data read from audio file');
  }

  const t0 = performance.now();

  const sampleRate = parseSampleRate('wav', bytes);
  const audioCtx = new AudioContext({ sampleRate });
  const audioBuffer = await audioCtx.decodeAudioData(bytes);

  graphContainer.innerHTML = '<progress-indicator></progress-indicator>';

  if (audioBuffer.numberOfChannels === 1) {
    const audio = new Float64Array(audioBuffer.getChannelData(0));

    const {
      edtValues,
      reverbTime,
      c50Values,
      c80Values,
      strength,
      earlyStrength,
      lateStrength,
      centerTime,
      earlyBassStrength,
      bassRatio,
      trebleRatio,
      aWeightedStrength,
      aWeightedC80,
    } = await processMonauralAudio(audio, audioBuffer.sampleRate);

    graphContainer.innerHTML = '';

    const audioInfoCard = new AudioInfoCard();
    audioInfoCard.sampleRate = audioBuffer.sampleRate;
    audioInfoCard.duration = audioBuffer.duration;
    audioInfoCard.channels = audioBuffer.numberOfChannels;
    graphContainer.appendChild(audioInfoCard);
    graphContainer.appendChild(createReverberationGraph(edtValues, reverbTime));
    graphContainer.appendChild(createC50C80Graph(c50Values, c80Values));
    graphContainer.appendChild(
      createStrengthGraph(strength, earlyStrength, lateStrength)
    );
    graphContainer.appendChild(
      createSquaredImpulseResponseGraph(audio, sampleRate, 100, 0.5)
    );
    const parametersCard = new ParametersCard();
    parametersCard.parameters = [
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
    ];
    graphContainer.appendChild(parametersCard);
  } else if (audioBuffer.numberOfChannels === 2) {
    const { iacc, eiacc } = await processBinauralAudio(
      BinauralAudio.fromAudioBuffer(audioBuffer)
    );

    graphContainer.innerHTML = '';

    graphContainer.appendChild(
      createInterauralCrossCorrelationGraph(iacc, eiacc)
    );
  } else {
    // eslint-disable-next-line no-alert
    alert('only monaural or binaural audio is supported');
  }

  const t1 = performance.now();

  const executionTime = new ExecutionTime();
  executionTime.milliseconds = t1 - t0;
  graphContainer.appendChild(executionTime);
}

fileDrop.addEventListener('change', ev => {
  const reader = new FileReader();
  reader.onload = processFile;
  reader.readAsArrayBuffer((ev as CustomEvent<{ file: File }>).detail.file);
});
