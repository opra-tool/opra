import {
  ImpulseResponseType,
  ImpulseResponse,
} from './analyzing/impulse-response';
import { MonauralResults } from './analyzing/monaural-processing';
import { BinauralResults } from './analyzing/binaural-processing';
import { MidSideResults } from './analyzing/mid-side-processing';
import { getFrequencyValues } from './analyzing/octave-band-frequencies';
import { Strengths } from './analyzing/strength';
import { LateralLevel } from './analyzing/lateral-level';

interface ResponseResultsSource {
  getResponses(): ImpulseResponse[];
  getResultsOrThrow(
    responseId: string
  ): MonauralResults | BinauralResults | MidSideResults;
  getStrengthResults(responseId: string): Strengths | null;
  getLateralLevelResults(responseId: string): LateralLevel | null;
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
      iacc?: number[];
      eiacc?: number[];
      earlyLateralEnergyFraction?: number[];
      earlyLateralLevel?: number[];
      lateLateralLevel?: number[];
    };
    singleFigureParameters: {
      centreTime: number;
      bassRatio: number;
      soundStrength?: number;
      trebleRatio?: number;
      earlyBassLevel?: number;
      aWeightedSoundStrength?: number;
      levelAdjustedC80?: number;
      iacc?: number;
      earlyLateralEnergyFraction?: number;
      lateLateralLevel?: number;
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
      const lateralLevelResults = this.source.getLateralLevelResults(
        response.id
      );

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
          earlySoundStrength: strengthResults?.earlyStrength,
          lateSoundStrength: strengthResults?.lateStrength,
          soundStrength: strengthResults?.strength,
          iacc: (results as BinauralResults).iaccBands,
          eiacc: (results as BinauralResults).eiaccBands,
          earlyLateralEnergyFraction: (results as MidSideResults)
            .earlyLateralEnergyFractionBands,
          earlyLateralLevel: lateralLevelResults?.earlyLateralLevelBands,
          lateLateralLevel: lateralLevelResults?.lateLateralLevelBands,
        },
        singleFigureParameters: {
          bassRatio: results.bassRatio,
          centreTime: results.centreTime,
          aWeightedSoundStrength: strengthResults?.aWeighted,
          soundStrength: strengthResults?.averageStrength,
          earlyBassLevel: strengthResults?.earlyBassLevel,
          levelAdjustedC80: strengthResults?.levelAdjustedC80,
          trebleRatio: strengthResults?.trebleRatio,
          iacc: (results as BinauralResults).iacc,
          earlyLateralEnergyFraction: (results as MidSideResults)
            .earlyLateralEnergyFraction,
          lateLateralLevel: lateralLevelResults?.lateLateralLevel,
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
