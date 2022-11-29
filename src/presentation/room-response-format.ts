import { RoomResponse } from '../audio/room-response';
import { UNIT_HERTZ, UNIT_SECONDS } from '../units';

type Input = Pick<
  RoomResponse,
  'numberOfChannels' | 'durationSeconds' | 'sampleRate'
>;

export function formatResponseSummary({
  numberOfChannels,
  durationSeconds,
  sampleRate,
}: Input): string {
  const audioType = numberOfChannels === 1 ? 'Monaural' : 'Binaural';

  return `${audioType} • ${sampleRate}${UNIT_HERTZ} • ${durationSeconds.toFixed(
    2
  )}${UNIT_SECONDS}`;
}
