import { TemplateResult } from 'lit';
import { ImpulseResponseType } from '../transfer-objects/impulse-response-file';
import {
  OctaveBands,
  OctaveBandValues,
} from '../transfer-objects/octave-bands';

export interface AcousticalParamDefinition {
  id: string;
  name: () => string | TemplateResult;
  description: () => string | TemplateResult;

  source: {
    url: string;
    shortName: string;
    longName: string;
  };

  symbol?: string | TemplateResult;
  unit?: string;

  forType: ImpulseResponseType;
  environmentDependent: boolean;
}

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

export interface SingleFigureParamDefinition extends AcousticalParamDefinition {
  type: 'single-figure';

  calculateSingleFigure: SingleFigureCalculationFn;
}

export interface OctaveBandParamDefinition extends AcousticalParamDefinition {
  type: 'octave-bands';

  calculateBands: OctaveBandCalculationFn;

  calculateSingleFigure(bandValues: OctaveBandValues): number;
}

export function createSingleFigureParameterDefinition(
  definition: AcousticalParamDefinition,
  calculateSingleFigure: SingleFigureCalculationFn
): SingleFigureParamDefinition {
  return {
    type: 'single-figure',
    ...definition,
    calculateSingleFigure,
  };
}

export function createOctaveBandParameterDefinition(
  definition: AcousticalParamDefinition,
  calculateBands: OctaveBandCalculationFn,
  calculateSingleFigure: (bandValues: OctaveBandValues) => number
): OctaveBandParamDefinition {
  return {
    type: 'octave-bands',
    ...definition,
    calculateSingleFigure,
    calculateBands,
  };
}
