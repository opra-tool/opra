import { msg } from '@lit/localize';
import { html } from 'lit';
import {
  REFERENCE_SOULODRE_BRADLEY_1995,
  REFERENCE_ISO_3382_1_2009,
} from '../references';
import { C80_PARAMETER } from './c50c80';
import {
  createOctaveBandParameterDefinition,
  createSingleFigureParameterDefinition,
} from '../param-definition';
import { e80Calc, l80Calc, e50Calc } from '../early-late-fractions';
import { OctaveBandValues } from '../../transfer-objects/octave-bands';
import { meanDecibel } from '../../math/decibels';
import { safeLog10 } from '../../math/safeLog10';

/**
 * Calculated as defined in IEC 61672-1:2013.
 *
 * Note: The value for 1kHz has been rounded to 0
 */
const A_WEIGHTING_CORRECTIONS = new OctaveBandValues([
  -26.3567, // 62.5 Hz
  -16.1897, // 125 Hz
  -8.67483, // 250 Hz
  -3.24781, // 500 Hz
  0, // 1000 Hz
  1.20167, // 2000 Hz
  0.963598, // 4000 Hz
  -1.14688, // 8000 Hz
]);

export const SOUND_STRENGTH_PARAMETER = createOctaveBandParameterDefinition(
  {
    id: 'soundStrength',
    symbol: 'G',
    name: () => msg('Sound Strength'),
    description: () => msg('Subjective level of sound'),
    unit: 'dB',
    source: REFERENCE_ISO_3382_1_2009,
    forType: 'monaural',
    environmentDependent: true,
  },
  (bands, _, lpe10) =>
    bands.collect(
      (buffer, centerFrequency) =>
        10 * safeLog10(buffer.sum()) - lpe10.band(centerFrequency)
    ),
  octaveBandValues =>
    meanDecibel(octaveBandValues.band(500), octaveBandValues.band(1000))
);

export const EARLY_SOUND_STRENGTH_PARAMETER =
  createOctaveBandParameterDefinition(
    {
      id: 'earlySoundStrength',
      name: () => msg('Early Sound Strength'),
      description: () => msg('Subjective level of sound'),
      unit: 'dB',
      source: REFERENCE_ISO_3382_1_2009,
      forType: 'monaural',
      environmentDependent: true,
    },
    (bands, _, lpe10) =>
      bands.collect(
        (buffer, centerFrequency) =>
          10 * safeLog10(e80Calc(buffer).sum()) - lpe10.band(centerFrequency)
      ),
    octaveBandValues =>
      meanDecibel(octaveBandValues.band(500), octaveBandValues.band(1000))
  );

export const LATE_SOUND_STRENGTH_PARAMETER =
  createOctaveBandParameterDefinition(
    {
      id: 'lateSoundStrength',
      name: () => msg('Late Sound Strength'),
      description: () => msg('Subjective level of sound'),
      unit: 'dB',
      source: REFERENCE_ISO_3382_1_2009,
      forType: 'monaural',
      environmentDependent: true,
    },
    (bands, _, lpe10) =>
      bands.collect(
        (buffer, centerFrequency) =>
          10 * safeLog10(l80Calc(buffer).sum()) - lpe10.band(centerFrequency)
      ),
    octaveBandValues =>
      meanDecibel(octaveBandValues.band(500), octaveBandValues.band(1000))
  );

export const A_WEIGHTED_SOUND_STRENGTH_PARAMETER =
  createSingleFigureParameterDefinition(
    {
      id: 'aWeightedSoundStrength',
      name: () => msg('A-weighted Sound Strength'),
      description: () => msg('Subjective level of sound'),
      unit: 'dB',
      source: REFERENCE_SOULODRE_BRADLEY_1995,
      forType: 'monaural',
      environmentDependent: true,
    },
    (_, { lookupOctaveBands }) => {
      const soundStrength = lookupOctaveBands(SOUND_STRENGTH_PARAMETER.id);

      const aWeighted = soundStrength.transform(
        (val, centerFrequency) =>
          val + A_WEIGHTING_CORRECTIONS.band(centerFrequency)
      );

      return meanDecibel(aWeighted.band(500), aWeighted.band(1000));
    }
  );

export const TREBLE_RATIO_PARAMETER = createSingleFigureParameterDefinition(
  {
    id: 'trebleRatio',
    name: () => msg('Treble Ratio'),
    description: () => msg('Perceived treble'),
    unit: 'dB',
    source: REFERENCE_SOULODRE_BRADLEY_1995,
    forType: 'monaural',
    environmentDependent: true,
  },
  (_, { lookupOctaveBands }) => {
    const lateSoundStrength = lookupOctaveBands(
      LATE_SOUND_STRENGTH_PARAMETER.id
    );

    return (
      lateSoundStrength.band(4000) -
      meanDecibel(lateSoundStrength.band(1000), lateSoundStrength.band(2000))
    );
  }
);

export const EARLY_BASS_LEVEL_PARAMETER = createSingleFigureParameterDefinition(
  {
    id: 'earlyBassLevel',
    name: () => msg('Early Bass Level'),
    description: () => msg('Perceived bass'),
    unit: 'dB',
    source: REFERENCE_SOULODRE_BRADLEY_1995,
    forType: 'monaural',
    environmentDependent: true,
  },
  (bands, _, lpe10) => {
    const e50SoundStrength = bands.collect(
      (band, centerFrequency) =>
        10 * safeLog10(e50Calc(band).sum()) - lpe10.band(centerFrequency)
    );

    return meanDecibel(
      e50SoundStrength.band(125),
      e50SoundStrength.band(250),
      e50SoundStrength.band(500)
    );
  }
);

export const LEVEL_ADJUSTED_C80_PARAMETER =
  createSingleFigureParameterDefinition(
    {
      id: 'levelAdjustedC80',
      name: () => html`Level-Adjusted C<sub>80</sub>`,
      description: () => msg('Perceived clarity of sound'),
      unit: 'dB',
      source: REFERENCE_SOULODRE_BRADLEY_1995,
      forType: 'monaural',
      environmentDependent: true,
    },
    (_, { lookupSingleFigure, lookupOctaveBands }) => {
      const c80 = lookupOctaveBands(C80_PARAMETER.id);
      const aWeighted = lookupSingleFigure(
        A_WEIGHTED_SOUND_STRENGTH_PARAMETER.id
      );

      return (c80.band(500) + c80.band(1000)) / 2 + 0.62 * aWeighted;
    }
  );
