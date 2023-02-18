import {
  ImpulseResponseType,
  ImpulseResponse,
} from '../analyzing/impulse-response';
import { MonauralResults } from '../analyzing/monaural-processing';
import { BinauralResults } from '../analyzing/binaural-processing';
import { MidSideResults } from '../analyzing/mid-side-processing';
import { getFrequencyValues } from '../analyzing/octave-band-frequencies';

interface ResponseResultsSource {
  getResponses(): ImpulseResponse[];
  getResultsOrThrow(
    responseId: string
  ): MonauralResults | BinauralResults | MidSideResults;
  // getStrengthResuls(responseId: string): Strengths | null;
  // getLateralLevelResults(responseId: string): LateralLevel | null;
}

type ExportData = {
  responses: {
    type: ImpulseResponseType;
    fileName: string;
    duration: number;
    sampleRate: number;
    octaveBandsFrequencies: number[];
    octaveBandParameters: {
      edt: number[];
      reverbTime: number[];
      c50: number[];
      c80: number[];
    };
    singleFigureParameters: {
      centreTime: number;
      bassRatio: number;
    };
    meta: {
      bandsSquaredSum: number[];
      e80BandsSquaredSum: number[];
      l80BandsSquaredSum: number[];
    };
  }[];
};

export class Exporter {
  private analyzer: ResponseResultsSource;

  constructor(analyzer: ResponseResultsSource) {
    this.analyzer = analyzer;
  }

  generateExportFile(): string {
    const exportObject = this.generateExportObject();

    return JSON.stringify(
      exportObject,
      (_, val) => {
        if (isNumbersArray(val)) {
          return JSON.stringify(val);
        }

        return val;
      },
      2
    )
      .replace(/"\[/g, '[')
      .replace(/\]"/g, ']');
  }

  generateExportObject(): ExportData {
    const responses = this.analyzer.getResponses();

    const exportData: ExportData = {
      responses: [],
    };

    for (const response of responses) {
      const results = this.analyzer.getResultsOrThrow(response.id);

      exportData.responses.push({
        type: response.type,
        fileName: response.fileName,
        duration: response.duration,
        sampleRate: response.sampleRate,
        octaveBandsFrequencies: getFrequencyValues(),
        octaveBandParameters: {
          c50: results.c50Bands,
          c80: results.c80Bands,
          edt: results.edtBands,
          reverbTime: results.reverbTimeBands,
        },
        singleFigureParameters: {
          bassRatio: results.bassRatio,
          centreTime: results.centreTime,
        },
        meta: {
          bandsSquaredSum: results.bandsSquaredSum,
          e80BandsSquaredSum: results.e80BandsSquaredSum,
          l80BandsSquaredSum: results.l80BandsSquaredSum,
        },
      });
    }

    return exportData;
  }
}

function isNumbersArray(maybeArray: unknown): boolean {
  return (
    maybeArray instanceof Array &&
    maybeArray.length > 0 &&
    typeof maybeArray[0] === 'number'
  );
}
