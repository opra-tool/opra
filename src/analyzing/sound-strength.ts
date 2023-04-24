import { calculateLpe10 } from './lpe10';
import { meanDecibel, meanDecibelEnergetic } from '../math/decibels';
import { safeLog10 } from '../math/safeLog10';

type SoundStrengths = {
  soundStrengthBands: number[];
  earlySoundStrengthBands: number[];
  lateSoundStrengthBands: number[];
  soundStrength: number;
  earlySoundStrength: number;
  lateSoundStrength: number;
  aWeightedSoundStrength: number;
  trebleRatio: number;
  earlyBassLevel: number;
  levelAdjustedC80: number;
  /* strength-based mid/side parameters */
  earlyLateralSoundLevelBands?: number[];
  lateLateralSoundLevelBands?: number[];
  earlyLateralSoundLevel?: number;
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

type EnvironmentParameters = {
  airTemperature: number;
  relativeHumidity: number;
  distanceFromSource: number;
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
  samples: Float32Array,
  sampleRate: number,
  {
    bandsSquaredSum,
    e50BandsSquaredSum,
    e80BandsSquaredSum,
    l80BandsSquaredSum,
    sideE80BandsSquaredSum,
    sideL80BandsSquaredSum,
    c80Bands,
  }: Input,
  environment: EnvironmentParameters
): Promise<SoundStrengths> {
  const lpe10 = await calculateLpe10(samples, sampleRate, environment);

  const soundStrengthBands = calculateSoundStrength(bandsSquaredSum, lpe10);
  const earlySoundStrengthBands = calculateSoundStrength(
    e80BandsSquaredSum,
    lpe10
  );
  const lateSoundStrengthBands = calculateSoundStrength(
    l80BandsSquaredSum,
    lpe10
  );
  const soundStrength = calculateMeanSoundStrength(soundStrengthBands);
  const earlySoundStrength = calculateMeanSoundStrength(
    earlySoundStrengthBands
  );
  const lateSoundStrength = calculateMeanSoundStrength(lateSoundStrengthBands);
  const aWeightedSoundStrength =
    calculateAWeightedSoundStrength(soundStrengthBands);
  const trebleRatio = calculateTrebleRatio(lateSoundStrengthBands);
  const earlyBassLevel = calculateEarlyBassLevel(
    calculateSoundStrength(e50BandsSquaredSum, lpe10)
  );
  const levelAdjustedC80 = calculateLevelAdjustedC80(
    c80Bands,
    aWeightedSoundStrength
  );

  const earlyLateralSoundLevelBands = sideE80BandsSquaredSum
    ? calculateSoundStrength(sideE80BandsSquaredSum, lpe10)
    : undefined;
  const lateLateralSoundLevelBands = sideL80BandsSquaredSum
    ? calculateSoundStrength(sideL80BandsSquaredSum, lpe10)
    : undefined;
  const earlyLateralSoundLevel = earlyLateralSoundLevelBands
    ? meanDecibelEnergetic(
        earlyLateralSoundLevelBands[1],
        earlyLateralSoundLevelBands[2],
        earlyLateralSoundLevelBands[3],
        earlyLateralSoundLevelBands[4]
      )
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
    soundStrengthBands,
    earlySoundStrengthBands,
    lateSoundStrengthBands,
    soundStrength,
    earlySoundStrength,
    lateSoundStrength,
    trebleRatio,
    earlyBassLevel,
    aWeightedSoundStrength,
    levelAdjustedC80,
    earlyLateralSoundLevelBands,
    lateLateralSoundLevelBands,
    earlyLateralSoundLevel,
    lateLateralSoundLevel,
  };
}

function calculateSoundStrength(
  bandsSquaredSum: number[],
  lpe10: number[]
): number[] {
  if (bandsSquaredSum.length !== lpe10.length) {
    throw new Error('expected bands length to match lpe10 length');
  }

  return bandsSquaredSum.map(
    (bandSum, i) => 10 * safeLog10(bandSum) - lpe10[i]
  );
}

function calculateAWeightedSoundStrength(soundStrength: number[]): number {
  return calculateMeanSoundStrength(
    soundStrength.map((val, i) => val + A_WEIGHTING_CORRECTIONS[i])
  );
}

function calculateMeanSoundStrength(soundStrength: number[]): number {
  return meanDecibel(soundStrength[3], soundStrength[4]);
}

/**
 * As defined in G.A. Soulodre and J. S. Bradley (1995): Subjective evaluation
of new room acoustic measures
 */
function calculateTrebleRatio(lateSoundStrength: number[]): number {
  return (
    lateSoundStrength[6] -
    meanDecibel(lateSoundStrength[4], lateSoundStrength[5])
  );
}

/**
 * As defined in G.A. Soulodre and J. S. Bradley (1995): Subjective evaluation
of new room acoustic measures
 */
function calculateEarlyBassLevel(earlySoundStrength: number[]): number {
  return meanDecibel(
    earlySoundStrength[1],
    earlySoundStrength[2],
    earlySoundStrength[3]
  );
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
