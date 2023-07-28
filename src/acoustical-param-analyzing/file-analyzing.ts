import {
  OctaveBandParamImplementation,
  SingleFigureParamImplementation,
} from './param-implementation';
import { ImpulseResponseType } from '../transfer-objects/impulse-response-file';
import {
  OctaveBandValues,
  OctaveBands,
} from '../transfer-objects/octave-bands';

type Bands = {
  omnidirectionalBands: OctaveBands;
  binauralBands?: OctaveBands;
  midSideBands?: OctaveBands;
};

type Results = {
  paramId: string;
  singleFigure: number;
  octaveBandValues?: OctaveBandValues;
}[];

export function analyzeFile(
  params: (SingleFigureParamImplementation | OctaveBandParamImplementation)[]
): (
  fileType: ImpulseResponseType,
  bands: Bands,
  lpe10: OctaveBandValues,
  previousResults: Results
) => Promise<Results> {
  return async (fileType, bands, lpe10, previousResults) => {
    const bandsForType = bandsLookup(bands);

    const singleFigureLookupMap = new Map<string, number>();
    const octaveBandLookupMap = new Map<string, OctaveBandValues>();

    // make sure to only add previous results for params not about to be calculated
    for (const result of previousResults) {
      if (!params.find(({ id }) => id === result.paramId)) {
        singleFigureLookupMap.set(result.paramId, result.singleFigure);
        if (result.octaveBandValues) {
          octaveBandLookupMap.set(result.paramId, result.octaveBandValues);
        }
      }
    }

    const resultsLookup = {
      lookupSingleFigure(paramId: string): number {
        const value = singleFigureLookupMap.get(paramId);

        if (!value) {
          throw new Error(
            `expected to find single-figure result for param '${paramId}'`
          );
        }

        return value;
      },
      lookupOctaveBands(paramId: string): OctaveBandValues {
        const value = octaveBandLookupMap.get(paramId);

        if (!value) {
          throw new Error(
            `expected to find octave band result for param '${paramId}'`
          );
        }

        return value;
      },
    };

    return params
      .filter(isCompatibleWithFileType(fileType))
      .map(param => {
        if (param.type === 'single-figure') {
          const singleFigure = param.calculateSingleFigure(
            bandsForType(param.forType),
            resultsLookup,
            lpe10
          );

          singleFigureLookupMap.set(param.id, singleFigure);

          return {
            paramId: param.id,
            singleFigure,
          };
        }

        const octaveBandValues = param.calculateBands(
          bandsForType(param.forType),
          resultsLookup,
          lpe10
        );
        const singleFigure = param.calculateSingleFigure(octaveBandValues);

        singleFigureLookupMap.set(param.id, singleFigure);
        octaveBandLookupMap.set(param.id, octaveBandValues);

        return {
          paramId: param.id,
          singleFigure,
          octaveBandValues,
        };
      })
      .concat(
        previousResults.filter(r => !params.find(p => p.id === r.paramId))
      );
  };
}

function bandsLookup({
  binauralBands,
  midSideBands,
  omnidirectionalBands,
}: Bands): (fileType: ImpulseResponseType) => OctaveBands {
  return type => {
    if (type === 'binaural') {
      if (!binauralBands) {
        throw new Error('expected to find binaural bands');
      }

      return binauralBands;
    }

    if (type === 'mid-side') {
      if (!midSideBands) {
        throw new Error('expected to find mid-side bands');
      }

      return midSideBands;
    }

    return omnidirectionalBands;
  };
}

function isCompatibleWithFileType(
  fileType: ImpulseResponseType
): (
  param: SingleFigureParamImplementation | OctaveBandParamImplementation
) => boolean {
  return param => {
    if (fileType === param.forType) {
      return true;
    }

    if (fileType === 'binaural') {
      return true;
    }

    if (fileType === 'mid-side' && param.forType === 'omnidirectional') {
      return true;
    }

    return false;
  };
}
