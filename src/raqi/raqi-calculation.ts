import { ImpulseResponseType } from '../transfer-objects/impulse-response-file';
import { RAQIParameter } from './raqi-data';

export function calcRAQIScore(
  raqiParameter: RAQIParameter,
  responseType: ImpulseResponseType,
  fileResults: { paramId: string; singleFigure: number }[]
): {
  paramId: string;
  scorePerStimulus: Record<string, number>;
} {
  const { coefficients, stimulusIntercepts, intercept } =
    raqiParameter[responseType];

  let accumulator = 0;

  for (const [name, value] of Object.entries(coefficients)) {
    const singleFigureResult = fileResults.find(
      r => r.paramId === name
    )?.singleFigure;

    if (!singleFigureResult) {
      throw new Error(
        `cannot find single-figure result for param '${name}' while calculating RAQI score`
      );
    }

    accumulator += singleFigureResult * value;
  }

  const scorePerStimulus: Record<string, number> = {};
  for (const [stimulusName, stimulusIntercept] of Object.entries(
    stimulusIntercepts
  )) {
    scorePerStimulus[stimulusName] =
      accumulator + stimulusIntercept + intercept;
  }

  return {
    paramId: raqiParameter.id,
    scorePerStimulus,
  };
}
