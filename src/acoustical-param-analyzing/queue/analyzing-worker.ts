import initWasm from 'opra-wasm-module';
import { CustomAudioBuffer } from '../../transfer-objects/audio-buffer';
import { ImpulseResponseType } from '../../transfer-objects/impulse-response-file';
import {
  OctaveBands,
  OctaveBandValues,
} from '../../transfer-objects/octave-bands';
import { analyzeFile } from '../file-analyzing';
import { AnalyzeRequest } from './analyze-request';
import { AnalyzeResponseMessageBody } from './analyze-response';
import { ALL_PARAMS, ENVIRONMENT_DEPENDENT_PARAMS } from '../params';

let wasmResolve: (value: void) => void;
const wasmReady = new Promise(resolve => {
  wasmResolve = resolve;
});

initWasm().then(() => {
  wasmResolve();
});

function octaveBands(
  rawBands: Float32Array[][],
  sampleRate: number
): OctaveBands {
  return new OctaveBands(
    rawBands.map(b => new CustomAudioBuffer(b, sampleRate))
  );
}

async function performAnalyzing({
  transactionId,
  payload: {
    fileType,
    lpe10,
    omnidirectionalBands,
    binauralBands,
    midSideBands,
    sampleRate,
    previousResults,
    onlyEnvironmentBasedParams,
  },
}: AnalyzeRequest) {
  await wasmReady;

  const params = onlyEnvironmentBasedParams
    ? ENVIRONMENT_DEPENDENT_PARAMS
    : ALL_PARAMS;

  const results = await analyzeFile(params)(
    fileType as ImpulseResponseType,
    {
      omnidirectionalBands: octaveBands(omnidirectionalBands, sampleRate),
      binauralBands: binauralBands
        ? octaveBands(binauralBands, sampleRate)
        : undefined,
      midSideBands: midSideBands
        ? octaveBands(midSideBands, sampleRate)
        : undefined,
    },
    new OctaveBandValues(lpe10),
    previousResults.map(r => ({
      ...r,
      octaveBandValues: r.octaveBandValues
        ? new OctaveBandValues(r.octaveBandValues)
        : undefined,
    }))
  );

  const msg: AnalyzeResponseMessageBody = {
    type: 'analyze-response',
    transactionId,
    payload: {
      results: results.map(r => ({
        ...r,
        octaveBandValues: r.octaveBandValues
          ? r.octaveBandValues.raw()
          : undefined,
      })),
    },
  };

  postMessage(msg);
}

onmessage = msg => {
  // TODO: error handling should be done in a more user-friendly way
  // eslint-disable-next-line no-console
  performAnalyzing(msg.data).catch(console.error);
};
