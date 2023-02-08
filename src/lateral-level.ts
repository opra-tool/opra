import { getFrequencyValues } from './components/graphs/common';
import { calculateSoundDampingInAir } from './dampening';
import { calculateLpe10 } from './lpe10';
import { MidSideResults } from './mid-side-processing';
import { calculateStaerkemass } from './strength';

export type LateralLevel = {
  earlyLateralLevelBands: number[];
  lateLateralLevelBands: number[];
};

type Options = {
  p0: number;
  temperature: number;
  relativeHumidity: number;
};

export async function calculateLateralLevel(
  { sideE80BandsSquaredSum, sideL80BandsSquaredSum }: MidSideResults,
  { p0, temperature, relativeHumidity }: Options
): Promise<LateralLevel> {
  const airCoeffs = getFrequencyValues().map(frequency =>
    calculateSoundDampingInAir(temperature, relativeHumidity, frequency)
  );
  const lpe10 = await calculateLpe10(airCoeffs);

  return {
    earlyLateralLevelBands: calculateStaerkemass(
      sideE80BandsSquaredSum,
      p0,
      lpe10
    ),
    lateLateralLevelBands: calculateStaerkemass(
      sideL80BandsSquaredSum,
      p0,
      lpe10
    ),
  };
}
