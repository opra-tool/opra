import { msg } from '@lit/localize';
import { html } from 'lit';
import { createParam } from '../param';
import {
  REFERENCE_ISO_3382_1_2009,
  REFERENCE_SOULODRE_BRADLEY_1995,
} from '../references';

export const SOUND_STRENGTH_PRESENTATION = createParam({
  id: 'soundStrength',
  symbol: () => 'G',
  name: () => msg('Sound Strength'),
  description: () => msg('Subjective level of sound'),
  unit: 'dB',
  source: REFERENCE_ISO_3382_1_2009,
});

export const EARLY_SOUND_STRENGTH_PRESENTATION = createParam({
  id: 'earlySoundStrength',
  name: () => msg('Early Sound Strength'),
  description: () => msg('Subjective level of sound'),
  unit: 'dB',
  source: REFERENCE_ISO_3382_1_2009,
});

export const LATE_SOUND_STRENGTH_PRESENTATION = createParam({
  id: 'lateSoundStrength',
  name: () => msg('Late Sound Strength'),
  description: () => msg('Subjective level of sound'),
  unit: 'dB',
  source: REFERENCE_ISO_3382_1_2009,
});

export const A_WEIGHTED_SOUND_STRENGTH_PRESENTATION = createParam({
  id: 'aWeightedSoundStrength',
  name: () => msg('A-weighted Sound Strength'),
  description: () => msg('Subjective level of sound'),
  unit: 'dB',
  source: REFERENCE_SOULODRE_BRADLEY_1995,
});

export const TREBLE_RATIO_PRESENTATION = createParam({
  id: 'trebleRatio',
  name: () => msg('Treble Ratio'),
  description: () => msg('Perceived treble'),
  unit: 'dB',
  source: REFERENCE_SOULODRE_BRADLEY_1995,
});

export const EARLY_BASS_LEVEL_PRESENTATION = createParam({
  id: 'earlyBassLevel',
  name: () => msg('Early Bass Level'),
  description: () => msg('Perceived bass'),
  unit: 'dB',
  source: REFERENCE_SOULODRE_BRADLEY_1995,
});

export const LEVEL_ADJUSTED_C80_PRESENTATION = createParam({
  id: 'levelAdjustedC80',
  name: () => html`Level-Adjusted <i>C<sub>80</sub></i>`,
  description: () => msg('Perceived clarity of sound'),
  unit: 'dB',
  source: REFERENCE_SOULODRE_BRADLEY_1995,
});
