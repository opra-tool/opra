import { OctaveBandValues } from '../../transfer-objects/octave-bands';

export type AnalyzeResponseData = {
  results: {
    paramId: string;
    singleFigure: number;
    octaveBandValues?: OctaveBandValues;
  }[];
};

export type AnalyzeResponseMessageBody = {
  type: 'analyze-response';
  transactionId: number;
  payload: {
    results: {
      paramId: string;
      singleFigure: number;
      octaveBandValues?: number[];
    }[];
  };
};
