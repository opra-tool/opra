import {
  ImpulseResponseType,
  ImpulseResponse,
} from './analyzing/impulse-response';
import { CENTER_FREQUENCIES } from './analyzing/octave-bands';
import { Results } from './analyzing/processing';
import { EnvironmentValues } from './analyzing/environment-values';

interface ResponseResultsSource {
  getResponses(): ImpulseResponse[];
  getResultsOrThrow(responseId: string): Results;
}

interface EnvironmentValuesSource {
  getEnvironmentValues(): EnvironmentValues;
}

type ExportData = {
  octaveBandsFrequencies: number[];
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
      earlyLateralSoundLevel?: number[];
      lateLateralSoundLevel?: number[];
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
      lateLateralSoundLevel?: number;
    };
    environmentValues: EnvironmentValues;
  }[];
};

export class Exporter {
  private source: ResponseResultsSource & EnvironmentValuesSource;

  constructor(source: ResponseResultsSource & EnvironmentValuesSource) {
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
      octaveBandsFrequencies: CENTER_FREQUENCIES,
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
          c50: results.c50Bands.raw(),
          c80: results.c80Bands.raw(),
          edt: results.edtBands.raw(),
          reverbTime: results.reverbTimeBands.raw(),
          earlySoundStrength: results.earlySoundStrengthBands?.raw(),
          lateSoundStrength: results.lateSoundStrengthBands?.raw(),
          soundStrength: results.soundStrengthBands?.raw(),
          iacc: results.iaccBands?.raw(),
          eiacc: results.eiaccBands?.raw(),
          earlyLateralEnergyFraction:
            results.earlyLateralEnergyFractionBands?.raw(),
          earlyLateralSoundLevel: results.earlyLateralSoundLevelBands?.raw(),
          lateLateralSoundLevel: results.lateLateralSoundLevelBands?.raw(),
        },
        singleFigureParameters: {
          bassRatio: results.bassRatio,
          c80: results.c80,
          centreTime: results.centreTime,
          reverbTime: results.reverbTime,
          aWeightedSoundStrength: results.aWeightedSoundStrength,
          soundStrength: results.soundStrength,
          earlyBassLevel: results.earlyBassLevel,
          levelAdjustedC80: results.levelAdjustedC80,
          trebleRatio: results.trebleRatio,
          iacc: results.iacc,
          earlyLateralEnergyFraction: results.earlyLateralEnergyFraction,
          lateLateralSoundLevel: results.lateLateralSoundLevel,
        },
        environmentValues: this.source.getEnvironmentValues(),
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
