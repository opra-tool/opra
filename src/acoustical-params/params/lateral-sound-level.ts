import { msg } from '@lit/localize';
import { html } from 'lit';
import { createOctaveBandParameterDefinition } from '../param-definition';
import { CustomAudioBuffer } from '../../transfer-objects/audio-buffer';
import { e80Calc, l80Calc } from '../early-late-fractions';
import { meanDecibelEnergetic } from '../../math/decibels';
import { safeLog10 } from '../../math/safeLog10';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

export const EARLY_LATERAL_SOUND_LEVEL_PARAMETER =
  createOctaveBandParameterDefinition(
    {
      id: 'earlyLateralSoundLevel',
      name: () => msg('Early Lateral Sound Level'),
      description: () => msg('Listener envelopment (LEV)'),
      symbol: html`L<sub>J,early</sub>`,
      unit: 'dB',
      source: REFERENCE_ISO_3382_1_2009,
      forType: 'mid-side',
      environmentDependent: true,
    },
    (bands, _, lpe10) =>
      bands.collect((band, centerFrequency) => {
        const sideBand = new CustomAudioBuffer(
          band.getChannel(1),
          band.sampleRate
        );
        const e80 = e80Calc(sideBand);

        return 10 * safeLog10(e80.sum()) - lpe10.band(centerFrequency);
      }),
    octaveBandValues =>
      meanDecibelEnergetic(
        octaveBandValues.band(125),
        octaveBandValues.band(250),
        octaveBandValues.band(500),
        octaveBandValues.band(1000)
      )
  );

export const LATE_LATERAL_SOUND_LEVEL_PARAMETER =
  createOctaveBandParameterDefinition(
    {
      id: 'lateLateralSoundLevel',
      name: () => msg('Late Lateral Sound Level'),
      description: () => msg('Listener envelopment (LEV)'),
      symbol: html`L<sub>J,late</sub>`,
      unit: 'dB',
      source: REFERENCE_ISO_3382_1_2009,
      forType: 'mid-side',
      environmentDependent: true,
    },
    (bands, _, lpe10) =>
      bands.collect((band, centerFrequency) => {
        const sideBand = new CustomAudioBuffer(
          band.getChannel(1),
          band.sampleRate
        );
        const l80 = l80Calc(sideBand);

        return 10 * safeLog10(l80.sum()) - lpe10.band(centerFrequency);
      }),
    octaveBandValues =>
      meanDecibelEnergetic(
        octaveBandValues.band(125),
        octaveBandValues.band(250),
        octaveBandValues.band(500),
        octaveBandValues.band(1000)
      )
  );
