import { ImpulseResponseType } from '../../transfer-objects/impulse-response-file';
import {
  OctaveBands,
  OctaveBandValues,
} from '../../transfer-objects/octave-bands';

export type AnalyzeRequestData = {
  fileType: ImpulseResponseType;
  sampleRate: number;
  bands: {
    omnidirectionalBands: OctaveBands;
    binauralBands?: OctaveBands;
    midSideBands?: OctaveBands;
  };
  lpe10: OctaveBandValues;
  previousResults: {
    paramId: string;
    singleFigure: number;
    octaveBandValues?: OctaveBandValues;
  }[];
  onlyEnvironmentBasedParams: boolean;
};

export type AnalyzeRequest = {
  type: 'analyze-request';
  transactionId: number;
  payload: {
    fileType: string;
    sampleRate: number;
    omnidirectionalBands: Float32Array[][];
    binauralBands?: Float32Array[][];
    midSideBands?: Float32Array[][];
    lpe10: number[];
    previousResults: {
      paramId: string;
      singleFigure: number;
      octaveBandValues?: number[];
    }[];
    onlyEnvironmentBasedParams: boolean;
  };
};

export function createAnalyzeRequest(
  data: AnalyzeRequestData,
  transactionId: number
  // eslint does not know 'Transferable'
  // eslint-disable-next-line no-undef
): [AnalyzeRequest, Transferable[]] {
  const payload = {
    fileType: data.fileType,
    lpe10: data.lpe10.raw(),
    omnidirectionalBands: data.bands.omnidirectionalBands
      .raw()
      .map(c => c.raw()),
    binauralBands: data?.bands.binauralBands?.raw().map(c => c.raw()),
    midSideBands: data?.bands.midSideBands?.raw().map(c => c.raw()),
    sampleRate: data.sampleRate,
    previousResults: data.previousResults.map(r => ({
      ...r,
      octaveBandValues: r.octaveBandValues?.raw(),
    })),
    onlyEnvironmentBasedParams: data.onlyEnvironmentBasedParams,
  };

  const transfer = [
    ...new Set([
      ...payload.omnidirectionalBands.flatMap(b => b).map(a => a.buffer),
      ...(payload.binauralBands?.flatMap(b => b).map(a => a.buffer) || []),
      ...(payload.midSideBands?.flatMap(b => b).map(a => a.buffer) || []),
    ]),
  ];

  return [
    {
      type: 'analyze-request',
      transactionId,
      payload,
    },
    transfer,
  ];
}
