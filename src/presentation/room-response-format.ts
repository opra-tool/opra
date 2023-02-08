import { UNIT_HERTZ, UNIT_SECONDS } from '../units';

type Input = {
  type: 'monaural' | 'binaural' | 'mid-side';
  duration: number;
  sampleRate: number;
};

const responseTypeNames = {
  monaural: 'Monaural',
  binaural: 'Binaural',
  'mid-side': 'Mid / Side',
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
