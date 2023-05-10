import { ImpulseResponseType } from '../analyzing/impulse-response';
import { Results } from '../analyzing/processing';
import { RAQIParameter } from './raqi-data';

export function calculateRAQIParameter(
  parameter: RAQIParameter,
  irType: ImpulseResponseType,
  results: Results,
  stimulusInterceptName: string
): number {
  const { coefficients, stimulusIntercepts, intercept } = parameter[irType];

  let accumulator = 0;

  for (const [name, value] of Object.entries(coefficients)) {
    const resultValue: unknown = results[name as keyof Results];
    if (typeof resultValue !== 'number') {
      throw new Error(
        `expected to find '${name}' in results, of type 'number'`
      );
    }

    accumulator += resultValue * value;
  }

  if (!objectHasKey(stimulusIntercepts, stimulusInterceptName)) {
    throw new Error(
      `expected to find a stimulus intercept for '${stimulusInterceptName}'`
    );
  }

  return accumulator + stimulusIntercepts[stimulusInterceptName] + intercept;
}

function objectHasKey<O extends object>(
  object: O,
  key: string | number | symbol
): key is keyof O {
  return key in object;
}
