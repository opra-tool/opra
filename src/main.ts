import { Chart, registerables } from 'chart.js';
import initWasm from 'wasm-raqi-online-toolbox';
import { ParametersCard } from './components/ParametersCard';
import { GraphCard } from './components/GraphCard';
import { parseSampleRate } from './audio_parsing/parseSampleRate';
import { requireElement } from './dom/requireElement';
import {
  earlyInterauralCrossCorrelation,
  interauralCrossCorrelation,
} from './interauralCrossCorrelation';
import { octfilt } from './octfilt';
import { elf } from './elf';
import { c50c80Calculation } from './c50c80Calculation';
import { createInterauralCrossCorrelationGraph } from './graphs/interauralCrossCorrelationGraph';
import { createC50C80Graph } from './graphs/c50c80Graph';
import {
  trimStarttimeBinaural,
  trimStarttimeMonaural,
} from './starttimeDetection';
import { arrayFilledWithZeros } from './math/arrayFilledWithZeros';
import { calculateStrength, calculateStrengthOfAWeighted } from './strength';
import { createStrengthGraph } from './graphs/strengthGraph';
import { edt, rev } from './reverberation';
import { createReverberationGraph } from './graphs/reverberation';
import { aWeightAudioSignal } from './digitalFilters/aWeighting';
import { ts } from './ts';
import { AudioInfoCard } from './components/AudioInfoCard';
import { BaseCard } from './components/BaseCard';

// init web assembly module
// eslint-disable-next-line no-console
initWasm().catch(console.error);

// register web components
declare global {
  interface HTMLElementTagNameMap {
    'audio-info-card': AudioInfoCard;
    'base-card': BaseCard;
    'graph-card': GraphCard;
    'parameters-card': ParametersCard;
  }
}

customElements.define('audio-info-card', AudioInfoCard);
customElements.define('base-card', BaseCard);
customElements.define('graph-card', GraphCard);
customElements.define('parameters-card', ParametersCard);

// prepare chart.js library
// TODO: only register components actually in use to reduce bundle size
Chart.register(...registerables);

const form = requireElement<HTMLFormElement>('form');
const soundfileInput = requireElement<HTMLInputElement>('soundfile-input');
const graphContainer = requireElement('graph-container');

async function processFile(e: ProgressEvent<FileReader>) {
  if (!e.target) {
    return;
  }

  const bytes = e.target.result;
  if (bytes === null || typeof bytes === 'string') {
    throw new Error('invalid data read from audio file');
  }

  const fs = parseSampleRate('wav', bytes);

  const audioCtx = new AudioContext({ sampleRate: fs });
  const audioBuffer = await audioCtx.decodeAudioData(bytes);

  graphContainer.innerHTML = '';

  if (audioBuffer.numberOfChannels === 1) {
    const p0 = 0.000001;
    // TODO: rename: raw audio
    const miror = Float64Array.from(audioBuffer.getChannelData(0));
    // TODO: rename: starttime trimmed raw audio
    const mir = trimStarttimeMonaural(miror);
    // TODO: rename: raw audio padded at its end with 10000 zeros
    const mirf = new Float64Array([...miror, ...arrayFilledWithZeros(10000)]);

    // octave band filtering
    const octaveBands = await octfilt(mirf, fs);
    // TODO: rename: individually startime trimmed and zero-padded octave bands
    const miro = octaveBands.map(band => {
      const trimmedBand = trimStarttimeMonaural(band);
      return new Float64Array([
        ...trimmedBand,
        ...arrayFilledWithZeros(band.length - trimmedBand.length),
      ]);
    });

    const earlyLateFractions = miro.map(band => elf(band, fs));

    const c50Values = new Float64Array(miro.length);
    const c80Values = new Float64Array(miro.length);
    for (let i = 0; i < miro.length; i += 1) {
      const { c50, c80 } = c50c80Calculation(earlyLateFractions[i]);
      c50Values[i] = c50;
      c80Values[i] = c80;
    }

    const strength = calculateStrength(miro, p0);
    const earlyStrength = calculateStrength(
      earlyLateFractions.map(val => val.e80),
      p0
    );
    const lateStrength = calculateStrength(
      earlyLateFractions.map(val => val.l80),
      p0
    );

    const mira = trimStarttimeMonaural(aWeightAudioSignal(mirf, fs));
    const aWeightedStrength = calculateStrengthOfAWeighted(mira, p0);
    const c80AWeighted =
      (c80Values[3] + c80Values[4]) / 2 - 0.62 * aWeightedStrength;

    const edtValues = edt(miro, fs);
    const reverbTime = rev(miro, 30, fs);

    const trebleRatio =
      lateStrength[6] - (lateStrength[4] + lateStrength[5]) / 2;
    const bassRation =
      (reverbTime[1] + reverbTime[2]) / (reverbTime[3] + reverbTime[4]);
    const earlyBassStrength =
      (earlyStrength[1] + earlyStrength[2] + earlyStrength[3]) / 3;
    const centerTime = ts(mir, fs);

    const audioInfoCard = new AudioInfoCard();
    audioInfoCard.sampleRate = audioBuffer.sampleRate;
    audioInfoCard.duration = audioBuffer.duration;
    audioInfoCard.channels = audioBuffer.numberOfChannels;
    graphContainer.appendChild(audioInfoCard);
    graphContainer.appendChild(createC50C80Graph(c50Values, c80Values));
    graphContainer.appendChild(
      createStrengthGraph(strength, earlyStrength, lateStrength)
    );
    graphContainer.appendChild(createReverberationGraph(edtValues, reverbTime));
    const parametersCard = new ParametersCard();
    parametersCard.parameters = [
      {
        name: 'A-weighted Strength',
        unit: 'dB',
        value: aWeightedStrength,
      },
      {
        name: 'C80 A-weighted',
        unit: 'dB',
        value: c80AWeighted,
      },
      {
        name: 'Treble Ratio',
        value: trebleRatio,
      },
      {
        name: 'Bass Ratio',
        value: bassRation,
      },
      {
        name: 'Early Bass Strength',
        value: earlyBassStrength,
        unit: 'dB',
      },
      {
        name: 'Center Time',
        value: centerTime,
        unit: 'sec',
      },
    ];
    graphContainer.appendChild(parametersCard);
  } else if (audioBuffer.numberOfChannels === 2) {
    const leftChannel = Float64Array.from(audioBuffer.getChannelData(0));
    const rightChannel = Float64Array.from(audioBuffer.getChannelData(1));

    const { leftChannel: trimmedLeft, rightChannel: trimmedRight } =
      trimStarttimeBinaural({
        leftChannel,
        rightChannel,
      });

    const octavesLeft = await octfilt(trimmedLeft, fs);
    const octavesRight = await octfilt(trimmedRight, fs);

    const iacc = await interauralCrossCorrelation(octavesLeft, octavesRight);
    const eiacc = await earlyInterauralCrossCorrelation(
      octavesLeft,
      octavesRight,
      fs
    );

    graphContainer.appendChild(
      createInterauralCrossCorrelationGraph(iacc, eiacc)
    );
  } else {
    // eslint-disable-next-line no-alert
    alert('only monaural or binaural audio is supported');
  }
}

form.addEventListener('submit', ev => {
  ev.preventDefault();

  const reader = new FileReader();
  reader.onload = processFile;
  if (soundfileInput.files !== null && soundfileInput.files.length > 0) {
    reader.readAsArrayBuffer(soundfileInput.files[0]);
  } else {
    throw new Error('no files in input');
  }
});
