import { expect } from '@esm-bundle/chai';
import {
  ImpulseResponseFile,
  ImpulseResponseType,
} from '../src/transfer-objects/impulse-response-file';
import { EnvironmentValues } from '../src/transfer-objects/environment-values';
import { JSONFileExporter } from '../src/exporter';
import {
  C50_PARAMETER,
  C80_PARAMETER,
} from '../src/acoustical-params/params/c50c80';
import { OctaveBandValues } from '../src/transfer-objects/octave-bands';

const makeImpulseResponseFile = (type: ImpulseResponseType) => ({
  id: 'testId',
  type,
  buffer: new AudioBuffer({
    length: 1,
    sampleRate: 44100,
    numberOfChannels: 1,
  }),
  duration: 100,
  fileName: 'audio.wav',
  sampleRate: 44100,
});

const makeDataSource = () => ({
  getAllImpulseResponseFiles(): ImpulseResponseFile[] {
    return [makeImpulseResponseFile('monaural')];
  },
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
  getSingleFigureParamResult(
    paramId: string,
    fileId: string
  ): number | undefined {
    return {
      c50: 1,
      c80: 2,
    }[paramId];
  },
  getOctaveBandParamResult(
    paramId: string,
    fileId: string
  ): OctaveBandValues | undefined {
    return {
      c50: new OctaveBandValues([1, 2, 3, 4, 5, 6, 7, 8]),
      c80: new OctaveBandValues([8, 7, 6, 5, 4, 3, 2, 1]),
    }[paramId];
  },
});

const EXPECTED_EXPORT = `{
  "octaveBandsFrequencies": [62.5,125,250,500,1000,2000,4000,8000],
  "impulseResponseFiles": [
    {
      "type": "monaural",
      "fileName": "audio.wav",
      "duration": 100,
      "sampleRate": 44100,
      "octaveBandParameters": {
        "c50": [1,2,3,4,5,6,7,8],
        "c80": [8,7,6,5,4,3,2,1]
      },
      "singleFigureParameters": {
        "c50": 1,
        "c80": 2
      },
      "environmentValues": {
        "airTemperature": 20,
        "distanceFromSource": 10,
        "relativeHumidity": 50,
        "airDensity": 1.2,
        "referencePressure": 0.01,
        "sourcePower": 1
      }
    }
  ]
}`;

it('it generates an export including all results', async () => {
  const exporter = new JSONFileExporter(
    [C50_PARAMETER, C80_PARAMETER],
    makeDataSource()
  );

  const actual = exporter.generateExportFile();

  expect(actual).to.equal(EXPECTED_EXPORT);
});
