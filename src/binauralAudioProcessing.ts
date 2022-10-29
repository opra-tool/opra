import { BinauralAudio } from './audio/BinauralAudio';
import {
  earlyInterauralCrossCorrelation,
  interauralCrossCorrelation,
} from './interauralCrossCorrelation';
import { octfiltBinaural } from './octfilt';
import { trimStarttimeBinaural } from './starttimeDetection';

type InterauralCrossCorrelation = {
  iacc: Float64Array;
  eiacc: Float64Array;
};

export async function processBinauralAudio(
  audio: BinauralAudio
): Promise<InterauralCrossCorrelation> {
  const trimmed = trimStarttimeBinaural(audio);

  const octaves = await octfiltBinaural(trimmed);

  const iacc = await interauralCrossCorrelation(octaves);
  const eiacc = await earlyInterauralCrossCorrelation(octaves);

  return {
    iacc,
    eiacc,
  };
}
