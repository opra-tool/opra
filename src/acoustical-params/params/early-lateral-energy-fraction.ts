import { msg } from '@lit/localize';
import { html } from 'lit';
import { createOctaveBandParameterDefinition } from '../param-definition';
import { e80Calc } from '../early-late-fractions';
import { arraySum } from '../../math/arrays';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

export const EARLY_LATERAL_ENERGY_FRACTION_PARAMETER =
  createOctaveBandParameterDefinition(
    {
      id: 'earlyLateralEnergyFraction',
      name: () => msg('Early Lateral Energy Fraction'),
      description: () => msg('Apparent source width (ASW)'),
      symbol: html`J<sub>LF</sub>`,
      source: REFERENCE_ISO_3382_1_2009,
      forType: 'mid-side',
      environmentDependent: false,
    },
    bands =>
      bands.collect(band => {
        const startTime = Math.round(0.005 * band.sampleRate);

        const e80 = e80Calc(band);

        const numerator = arraySum(e80.getChannel(1).subarray(startTime));
        const denominator = arraySum(e80.getChannel(0));

        return numerator / denominator;
      }),
    octaveBandValues =>
      (octaveBandValues.band(125) +
        octaveBandValues.band(250) +
        octaveBandValues.band(500) +
        octaveBandValues.band(1000)) /
      4
  );
