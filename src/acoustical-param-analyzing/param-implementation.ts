import { ImpulseResponseType } from '../transfer-objects/impulse-response-file';
import {
  OctaveBands,
  OctaveBandValues,
} from '../transfer-objects/octave-bands';

interface ResultsLookup {
  lookupSingleFigure(paramId: string): number;
  lookupOctaveBands(paramId: string): OctaveBandValues;
}

interface SingleFigureCalculationFn {
  (
    bands: OctaveBands,
    resultsLookup: ResultsLookup,
    lpe10: OctaveBandValues
  ): number;
}

interface OctaveBandCalculationFn {
  (
    bands: OctaveBands,
    resultsLookup: ResultsLookup,
    lpe10: OctaveBandValues
  ): OctaveBandValues;
}

export interface SingleFigureParamImplementation {
  type: 'single-figure';
  id: string;

  forType: ImpulseResponseType;

  calculateSingleFigure: SingleFigureCalculationFn;
}

export interface OctaveBandParamImplementation {
  type: 'octave-bands';
  id: string;

  forType: ImpulseResponseType;

  calculateBands: OctaveBandCalculationFn;

  calculateSingleFigure(bandValues: OctaveBandValues): number;
}

export function createSingleFigureParameterImplementation(
  id: string,
  forType: ImpulseResponseType,
  calculateSingleFigure: SingleFigureCalculationFn
): SingleFigureParamImplementation {
  return {
    type: 'single-figure',
    id,
    forType,
    calculateSingleFigure,
  };
}

export function createOctaveBandParameterImplementation(
  id: string,
  forType: ImpulseResponseType,
  calculateBands: OctaveBandCalculationFn,
  calculateSingleFigure: (bandValues: OctaveBandValues) => number
): OctaveBandParamImplementation {
  return {
    type: 'octave-bands',
    id,
    forType,
    calculateSingleFigure,
    calculateBands,
  };
}
