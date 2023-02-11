import { ImpulseResponseType } from '../analyzing/impulse-response';
import { UNIT_HERTZ, UNIT_SECONDS } from './units';

type Input = {
  type: ImpulseResponseType;
  duration: number;
  sampleRate: number;
};

const responseTypeNames = {
  monaural: 'Monaural',
  binaural: 'Binaural',
  'mid-side': 'M/S',
};

export function formatResponseSummary({
  type,
  duration,
  sampleRate,
}: Input): string {
  return `${
    responseTypeNames[type]
  } • ${sampleRate}${UNIT_HERTZ} • ${duration.toFixed(2)}${UNIT_SECONDS}`;
}
