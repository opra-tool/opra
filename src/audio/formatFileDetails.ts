import { UNIT_HERTZ, UNIT_SECONDS } from '../units';

type Details = {
  channelCount: number;
  durationSeconds: number;
  sampleRate: number;
};

export function formatFileDetails({
  channelCount,
  durationSeconds,
  sampleRate,
}: Details): string {
  const audioType = channelCount === 1 ? 'Monaural' : 'Binaural';

  return `${audioType} • ${sampleRate}${UNIT_HERTZ} • ${durationSeconds.toFixed(
    2
  )}${UNIT_SECONDS}`;
}
