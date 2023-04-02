import {
  ImpulseResponseType,
  ImpulseResponse,
} from './analyzing/impulse-response';
import { BinauralResults } from './analyzing/binaural-processing';
import { getFrequencyValues } from './analyzing/octave-band-frequencies';
import { Results } from './analyzing/analyzer';

interface ResponseResultsSource {
  getResponses(): ImpulseResponse[];
  getResultsOrThrow(responseId: string): Results;
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
      bassRatio: number;
      c80: number;
      centreTime: number;
      reverbTime: number;
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
          earlySoundStrength: results.earlyStrengthBands,
          lateSoundStrength: results.lateStrengthBands,
          soundStrength: results.strengthBands,
          iacc: results.iaccBands,
          eiacc: results.eiaccBands,
          earlyLateralEnergyFraction: results.earlyLateralEnergyFractionBands,
          earlyLateralLevel: results.earlyLateralSoundLevelBands,
          lateLateralLevel: results.lateLateralSoundLevelBands,
        },
        singleFigureParameters: {
          bassRatio: results.bassRatio,
          c80: results.c80,
          centreTime: results.centreTime,
          reverbTime: results.reverbTime,
          aWeightedSoundStrength: results.aWeightedStrength,
          soundStrength: results.strength,
          earlyBassLevel: results.earlyBassLevel,
          levelAdjustedC80: results.levelAdjustedC80,
          trebleRatio: results.trebleRatio,
          iacc: (results as BinauralResults).iacc,
          earlyLateralEnergyFraction: results.earlyLateralEnergyFraction,
          lateLateralLevel: results.lateLateralSoundLevel,
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
