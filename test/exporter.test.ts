import { expect } from '@esm-bundle/chai';
import { EnvironmentValues } from '../src/analyzing/environment-values';
import {
  ImpulseResponseType,
  ImpulseResponse,
} from '../src/analyzing/impulse-response';
import { Exporter } from '../src/exporter';

const makeResponse = (type: ImpulseResponseType) => ({
  id: 'testId',
  type,
  buffer: new AudioBuffer({
    length: 1,
    sampleRate: 44100,
    numberOfChannels: 1,
  }),
  color: '',
  duration: 100,
  fileName: 'audio.wav',
  sampleRate: 44100,
});

const makeMonauralResults = () => ({
  c50Bands: [1, 2, 3, 4, 5, 6, 7, 8],
  c80Bands: [1, 2, 3, 4, 5, 6, 7, 8],
  c80: 1,
  edtBands: [1, 2, 3, 4, 5, 6, 7, 8],
  reverbTimeBands: [1, 2, 3, 4, 5, 6, 7, 8],
  reverbTime: 1,
  bassRatio: 1,
  centreTime: 2,
});

const makeSource = () => ({
  getResponses(): ImpulseResponse[] {
    return [makeResponse('monaural')];
  },
  getResultsOrThrow: makeMonauralResults,
  getEnvironmentValues(): EnvironmentValues {
    return {
      airTemperature: 20,
      distanceFromSource: 10,
      relativeHumidity: 50,
      airDensity: 1.2,
      referencePressure: 0.01,
      sourcePower: 1,
    };
  },
});

it('it generates a monaural export', async () => {
  const exporter = new Exporter(makeSource());

  const expected = await fetch('/testfiles/exports/monaural-export.json').then(
    r => r.text()
  );
  const actual = exporter.generateExportFile();

  expect(actual).to.equal(expected);
});

it('it generates a binaural export', async () => {
  const source = makeSource();
  source.getResponses = () => [makeResponse('binaural')];
  source.getResultsOrThrow = () => ({
    ...makeMonauralResults(),
    iaccBands: [1, 2, 3, 4, 5, 6, 7, 8],
    eiaccBands: [1, 2, 3, 4, 5, 6, 7, 8],
    iacc: 1,
  });
  const exporter = new Exporter(source);

  const expected = await fetch('/testfiles/exports/binaural-export.json').then(
    r => r.text()
  );
  const actual = exporter.generateExportFile();

  expect(actual).to.equal(expected);
});

it('it generates a mid/side export', async () => {
  const source = makeSource();
  source.getResponses = () => [makeResponse('mid-side')];
  source.getResultsOrThrow = () => ({
    ...makeMonauralResults(),
    earlyLateralEnergyFractionBands: [1, 2, 3, 4, 5, 6, 7, 8],
    earlyLateralEnergyFraction: 1,
    earlyLateralSoundLevelBands: [1, 2, 3, 4, 5, 6, 7, 8],
    lateLateralSoundLevelBands: [1, 2, 3, 4, 5, 6, 7, 8],
    lateLateralSoundLevel: 1,
  });
  const exporter = new Exporter(source);

  const expected = await fetch('/testfiles/exports/mid-side-export.json').then(
    r => r.text()
  );
  const actual = exporter.generateExportFile();

  expect(actual).to.equal(expected);
});

it('includes strength values', async () => {
  const source = makeSource();
  source.getResultsOrThrow = () => ({
    ...makeMonauralResults(),
    soundStrength: 1,
    aWeightedSoundStrength: 1,
    earlyBassLevel: 1,
    levelAdjustedC80: 1,
    trebleRatio: 1,
    soundStrengthBands: [1, 2, 3, 4, 5, 6, 7, 8],
    earlySoundStrengthBands: [1, 2, 3, 4, 5, 6, 7, 8],
    lateSoundStrengthBands: [1, 2, 3, 4, 5, 6, 7, 8],
  });
  const exporter = new Exporter(source);

  const expected = await fetch('/testfiles/exports/strengths-export.json').then(
    r => r.text()
  );
  const actual = exporter.generateExportFile();

  expect(actual).to.equal(expected);
});
