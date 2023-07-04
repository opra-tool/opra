import {
  ImpulseResponseType,
  ImpulseResponseFile,
} from './transfer-objects/impulse-response-file';
import {
  CENTER_FREQUENCIES,
  OctaveBandValues,
} from './transfer-objects/octave-bands';
import { EnvironmentValues } from './transfer-objects/environment-values';
import {
  SingleFigureParamDefinition,
  OctaveBandParamDefinition,
} from './acoustical-params/param-definition';

interface DataSource {
  getAllImpulseResponseFiles(): ImpulseResponseFile[];
  getEnvironmentValues(): EnvironmentValues;
  getSingleFigureParamResult(
    paramId: string,
    fileId: string
  ): number | undefined;
  getOctaveBandParamResult(
    paramId: string,
    fileId: string
  ): OctaveBandValues | undefined;
}

type ExportData = {
  octaveBandsFrequencies: number[];
  impulseResponseFiles: {
    type: ImpulseResponseType;
    fileName: string;
    duration: number;
    sampleRate: number;
    octaveBandParameters: Record<string, number[]>;
    singleFigureParameters: Record<string, number>;
    environmentValues: EnvironmentValues;
  }[];
};

export class JSONFileExporter {
  private exportParams: (
    | SingleFigureParamDefinition
    | OctaveBandParamDefinition
  )[];

  private dataSource: DataSource;

  constructor(
    params: (SingleFigureParamDefinition | OctaveBandParamDefinition)[],
    dataSource: DataSource
  ) {
    this.exportParams = params;
    this.dataSource = dataSource;
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
    const results = this.getExportableResults();

    return {
      octaveBandsFrequencies: CENTER_FREQUENCIES,
      impulseResponseFiles: results.map(
        ({ file, singleFigureResults, octaveBandResults }) => ({
          type: file.type,
          fileName: file.fileName,
          duration: file.duration,
          sampleRate: file.sampleRate,
          octaveBandParameters: octaveBandResults,
          singleFigureParameters: singleFigureResults,
          environmentValues: this.dataSource.getEnvironmentValues(),
        })
      ),
    };
  }

  private getExportableResults() {
    return this.dataSource.getAllImpulseResponseFiles().map(file => ({
      file,
      singleFigureResults: this.exportParams.reduce((acc, param) => {
        const result = this.dataSource.getSingleFigureParamResult(
          param.id,
          file.id
        );

        if (result) {
          acc[param.id] = result;
        }

        return acc;
      }, {} as Record<string, number>),
      octaveBandResults: this.exportParams.reduce((acc, param) => {
        const result = this.dataSource.getOctaveBandParamResult(
          param.id,
          file.id
        );

        if (result) {
          acc[param.id] = result.raw();
        }

        return acc;
      }, {} as Record<string, number[]>),
    }));
  }
}

function isNumbersArray(maybeArray: unknown): boolean {
  return (
    maybeArray instanceof Array &&
    maybeArray.length > 0 &&
    typeof maybeArray[0] === 'number'
  );
}
