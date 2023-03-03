import {
  ImpulseResponseType,
  ImpulseResponse,
} from './analyzing/impulse-response';
import { MonauralResults } from './analyzing/monaural-processing';
import { BinauralResults } from './analyzing/binaural-processing';
import { MidSideResults } from './analyzing/mid-side-processing';
import { getFrequencyValues } from './analyzing/octave-band-frequencies';
import { Strengths } from './analyzing/strength';

interface ResponseResultsSource {
  getResponses(): ImpulseResponse[];
  getResultsOrThrow(
    responseId: string
  ): MonauralResults | BinauralResults | MidSideResults;
  getStrengthResults(responseId: string): Strengths | null;
  // getLateralLevelResults(responseId: string): LateralLevel | null;
}

interface EnvironmentParametersSource {
  getP0(): number | null;
  getAirTemperature(): number;
  getRelativeHumidity(): number;
}

type ExportData = {
  octaveBandsFrequencies: number[];
  environmentParameters: {
    p0: number | null;
    airTemperature: number;
    relativeHumidity: number;
  };
  impulseResponses: {
    type: ImpulseResponseType;
    fileName: string;
    duration: number;
    sampleRate: number;
    octaveBandParameters: {
      edt: number[];
      reverbTime: number[];
      c50: number[];
      c80: number[];
      soundStrength?: number[];
      earlySoundStrength?: number[];
      lateSoundStrength?: number[];
    };
    singleFigureParameters: {
      centreTime: number;
      bassRatio: number;
      soundStrength?: number;
      trebleRatio?: number;
      earlyBassLevel?: number;
      aWeightedSoundStrength?: number;
      levelAdjustedC80?: number;
    };
  }[];
};

export class Exporter {
  private source: ResponseResultsSource & EnvironmentParametersSource;

  constructor(source: ResponseResultsSource & EnvironmentParametersSource) {
    this.source = source;
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
    const responses = this.source.getResponses();

    const exportData: ExportData = {
      octaveBandsFrequencies: getFrequencyValues(),
      environmentParameters: {
        p0: this.source.getP0(),
        airTemperature: this.source.getAirTemperature(),
        relativeHumidity: this.source.getRelativeHumidity(),
      },
      impulseResponses: [],
    };

    for (const response of responses) {
      const results = this.source.getResultsOrThrow(response.id);
      const strengthResults = this.source.getStrengthResults(response.id);

      exportData.impulseResponses.push({
        type: response.type,
        fileName: response.fileName,
        duration: response.duration,
        sampleRate: response.sampleRate,
        octaveBandParameters: {
          c50: results.c50Bands,
          c80: results.c80Bands,
          edt: results.edtBands,
          reverbTime: results.reverbTimeBands,
          earlySoundStrength: strengthResults
            ? strengthResults.earlyStrength
            : undefined,
          lateSoundStrength: strengthResults
            ? strengthResults.lateStrength
            : undefined,
          soundStrength: strengthResults ? strengthResults.strength : undefined,
        },
        singleFigureParameters: {
          bassRatio: results.bassRatio,
          centreTime: results.centreTime,
          aWeightedSoundStrength: strengthResults
            ? strengthResults.aWeighted
            : undefined,
          soundStrength: strengthResults
            ? strengthResults.averageStrength
            : undefined,
          earlyBassLevel: strengthResults
            ? strengthResults.earlyBassLevel
            : undefined,
          levelAdjustedC80: strengthResults
            ? strengthResults.levelAdjustedC80
            : undefined,
          trebleRatio: strengthResults
            ? strengthResults.trebleRatio
            : undefined,
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
