import { RoomResponse } from '../audio/room-response';
import { UNIT_HERTZ, UNIT_SECONDS } from '../units';

type Input = {
  type: 'monaural' | 'binaural';
  duration: number;
  sampleRate: number;
};

const responseTypeNames = {
  monaural: 'Monaural',
  binaural: 'Binaural',
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
