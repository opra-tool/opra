import { expect } from '@esm-bundle/chai';
import {
  ImpulseResponseType,
  ImpulseResponse,
} from '../src/analyzing/impulse-response';
import { Exporter } from '../src/exporter';
import { Strengths } from '../src/analyzing/strength';
import { LateralLevel } from '../src/analyzing/lateral-level';

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
  bandsSquaredSum: [1, 2, 3, 4, 5, 6, 7, 8],
  e80BandsSquaredSum: [1, 2, 3, 4, 5, 6, 7, 8],
  l80BandsSquaredSum: [1, 2, 3, 4, 5, 6, 7, 8],
  c50Bands: [1, 2, 3, 4, 5, 6, 7, 8],
  c80Bands: [1, 2, 3, 4, 5, 6, 7, 8],
  edtBands: [1, 2, 3, 4, 5, 6, 7, 8],
  reverbTimeBands: [1, 2, 3, 4, 5, 6, 7, 8],
  bassRatio: 1,
  centreTime: 2,
  squaredIRPoints: [{ x: 1, y: 2 }],
});

const makeSource = () => ({
  getResponses(): ImpulseResponse[] {
    return [makeResponse('monaural')];
  },
  getResultsOrThrow: makeMonauralResults,
  getLateralLevelResults(): LateralLevel | null {
    return null;
  },
  getStrengthResults(): Strengths | null {
    return null;
  },
  getP0(): number | null {
    return null;
  },
  getAirTemperature(): number {
    return 20;
  },
  getRelativeHumidity(): number {
    return 50;
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

it('it generates a mid/side export including lateral level values', async () => {
  const source = makeSource();
  source.getP0 = () => 0.01;
  source.getResponses = () => [makeResponse('mid-side')];
  source.getResultsOrThrow = () => ({
    ...makeMonauralResults(),
    earlyLateralEnergyFractionBands: [1, 2, 3, 4, 5, 6, 7, 8],
    earlyLateralEnergyFraction: 1,
  });
  source.getLateralLevelResults = () => ({
    earlyLateralLevelBands: [1, 2, 3, 4, 5, 6, 7, 8],
    lateLateralLevelBands: [1, 2, 3, 4, 5, 6, 7, 8],
    lateLateralLevel: 1,
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
  source.getP0 = () => 0.01;
  source.getStrengthResults = () => ({
    averageStrength: 1,
    aWeighted: 1,
    earlyBassLevel: 1,
    levelAdjustedC80: 1,
    trebleRatio: 1,
    strength: [1, 2, 3, 4, 5, 6, 7, 8],
    earlyStrength: [1, 2, 3, 4, 5, 6, 7, 8],
    lateStrength: [1, 2, 3, 4, 5, 6, 7, 8],
  });
  const exporter = new Exporter(source);

  const expected = await fetch('/testfiles/exports/strengths-export.json').then(
    r => r.text()
  );
  const actual = exporter.generateExportFile();

  expect(actual).to.equal(expected);
});
