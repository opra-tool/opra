import { RoomResponse } from '../audio/room-response';
import { UNIT_HERTZ, UNIT_SECONDS } from '../units';

type Input = Pick<RoomResponse, 'type' | 'durationSeconds' | 'sampleRate'>;

const responseTypeNames = {
  monaural: 'Monaural',
  binaural: 'Binaural',
};

export function formatResponseSummary({
  type,
  durationSeconds,
  sampleRate,
}: Input): string {
  return `${
    responseTypeNames[type]
  } • ${sampleRate}${UNIT_HERTZ} • ${durationSeconds.toFixed(
    2
  )}${UNIT_SECONDS}`;
}
