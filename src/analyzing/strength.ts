import { getFrequencyValues } from './octave-band-frequencies';
import { calculateSoundDampingInAir } from './dampening';
import { calculateLpe10 } from './lpe10';
import {
  addDecibel,
  meanDecibel,
  meanDecibelEnergetic,
} from '../math/decibels';
import { safeLog10 } from '../math/safeLog10';

type Strengths = {
  strengthBands: number[];
  earlyStrengthBands: number[];
  lateStrengthBands: number[];
  strength: number;
  aWeightedStrength: number;
  trebleRatio: number;
  earlyBassLevel: number;
  levelAdjustedC80: number;
  /* strength-based mid/side parameters */
  earlyLateralSoundLevelBands?: number[];
  lateLateralSoundLevelBands?: number[];
  lateLateralSoundLevel?: number;
};

type Input = {
  bandsSquaredSum: number[];
  e50BandsSquaredSum: number[];
  e80BandsSquaredSum: number[];
  l80BandsSquaredSum: number[];
  c80Bands: number[];
  sideE80BandsSquaredSum?: number[];
  sideL80BandsSquaredSum?: number[];
};

type Options = {
  p0: number;
  temperature: number;
  relativeHumidity: number;
};

/**
 * Calculated as defined in IEC 61672-1:2013.
 *
 * Note: The value for 1kHz has been rounded to 0
 */
const A_WEIGHTING_CORRECTIONS = [
  -26.3567, // 62.5 Hz
  -16.1897, // 125 Hz
  -8.67483, // 250 Hz
  -3.24781, // 500 Hz
  0, // 1000 Hz
  1.20167, // 2000 Hz
  0.963598, // 4000 Hz
  -1.14688, // 8000 Hz
];

export async function calculateStrengths(
  {
    bandsSquaredSum,
    e50BandsSquaredSum,
    e80BandsSquaredSum,
    l80BandsSquaredSum,
    sideE80BandsSquaredSum,
    sideL80BandsSquaredSum,
    c80Bands,
  }: Input,
  { p0, temperature, relativeHumidity }: Options
): Promise<Strengths> {
  const airCoeffs = getFrequencyValues().map(frequency =>
    calculateSoundDampingInAir(temperature, relativeHumidity, frequency)
  );
  const lpe10 = await calculateLpe10(airCoeffs);

  const strengthBands = calculateSoundStrength(bandsSquaredSum, p0, lpe10);
  const earlyStrengthBands = calculateSoundStrength(
    e80BandsSquaredSum,
    p0,
    lpe10
  );
  const lateStrengthBands = calculateSoundStrength(
    l80BandsSquaredSum,
    p0,
    lpe10
  );
  const strength = calculateMeanSoundStrength(strengthBands);
  const aWeightedStrength = calculateAWeightedSoundStrength(strengthBands);
  const trebleRatio = calculateTrebleRatio(lateStrengthBands);
  const earlyBassLevel = calculateEarlyBassLevel(
    calculateSoundStrength(e50BandsSquaredSum, p0, lpe10)
  );
  const levelAdjustedC80 = calculateLevelAdjustedC80(
    c80Bands,
    aWeightedStrength
  );

  const earlyLateralSoundLevelBands = sideE80BandsSquaredSum
    ? calculateSoundStrength(sideE80BandsSquaredSum, p0, lpe10)
    : undefined;
  const lateLateralSoundLevelBands = sideL80BandsSquaredSum
    ? calculateSoundStrength(sideL80BandsSquaredSum, p0, lpe10)
    : undefined;
  const lateLateralSoundLevel = lateLateralSoundLevelBands
    ? meanDecibelEnergetic(
        lateLateralSoundLevelBands[1],
        lateLateralSoundLevelBands[2],
        lateLateralSoundLevelBands[3],
        lateLateralSoundLevelBands[4]
      )
    : undefined;

  return {
    strengthBands,
    earlyStrengthBands,
    lateStrengthBands,
    strength,
    trebleRatio,
    earlyBassLevel,
    aWeightedStrength,
    levelAdjustedC80,
    earlyLateralSoundLevelBands,
    lateLateralSoundLevelBands,
    lateLateralSoundLevel,
  };
}

export function calculateSoundStrength(
  bandsSquaredSum: number[],
  p0: number,
  lpe10: number[]
): number[] {
  if (bandsSquaredSum.length !== lpe10.length) {
    throw new Error('expected bands length to match lpe10 length');
  }

  return bandsSquaredSum.map((bandSum, i) => {
    const lpe = 10 * safeLog10(bandSum / p0 ** 2);

    return lpe - lpe10[i];
  });
}

function calculateAWeightedSoundStrength(strength: number[]): number {
  return calculateMeanSoundStrength(
    strength.map((val, i) => val + A_WEIGHTING_CORRECTIONS[i])
  );
}

function calculateMeanSoundStrength(strength: number[]): number {
  return meanDecibel(strength[3], strength[4]);
}

/**
 * As defined in G.A. Soulodre and J. S. Bradley (1995): Subjective evaluation
of new room acoustic measures
 */
function calculateTrebleRatio(lateStrength: number[]): number {
  return lateStrength[6] - meanDecibel(lateStrength[4], lateStrength[5]);
}

/**
 * As defined in G.A. Soulodre and J. S. Bradley (1995): Subjective evaluation
of new room acoustic measures
 */
function calculateEarlyBassLevel(earlyStrength: number[]): number {
  return meanDecibel(earlyStrength[1], earlyStrength[2], earlyStrength[3]);
}

/**
 * As defined in G.A. Soulodre and J. S. Bradley (1995): Subjective evaluation
of new room acoustic measures
 */
function calculateLevelAdjustedC80(
  c80Bands: number[],
  aWeighted: number
): number {
  return (c80Bands[3] + c80Bands[4]) / 2 + 0.62 * aWeighted;
}
