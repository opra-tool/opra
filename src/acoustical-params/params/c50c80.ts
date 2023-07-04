import { msg } from '@lit/localize';
import { html } from 'lit';
import { createOctaveBandParameterDefinition } from '../param-definition';
import { e50Calc, l50Calc, e80Calc, l80Calc } from '../early-late-fractions';
import { safeLog10 } from '../../math/safeLog10';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

export const C50_PARAMETER = createOctaveBandParameterDefinition(
  {
    id: 'c50',
    name: () => msg('Clarity'),
    description: () => msg('Perceived clarity of sound, primarily speech'),
    unit: 'dB',
    symbol: html`C<sub>50</sub>`,
    source: REFERENCE_ISO_3382_1_2009,
    forType: 'omnidirectional',
    environmentDependent: false,
  },
  bands =>
    bands.collect(band => {
      const e50Sum = e50Calc(band).sum();
      const l50Sum = l50Calc(band).sum();

      return 10 * safeLog10(e50Sum / l50Sum);
    }),
  octaveBandValues =>
    (octaveBandValues.band(500) + octaveBandValues.band(1000)) / 2
);

export const C80_PARAMETER = createOctaveBandParameterDefinition(
  {
    id: 'c80',
    name: () => msg('Clarity'),
    description: () => msg('Perceived clarity of sound, primarily music'),
    symbol: html`C<sub>80</sub>`,
    unit: 'dB',
    source: REFERENCE_ISO_3382_1_2009,
    forType: 'omnidirectional',
    environmentDependent: false,
  },
  bands =>
    bands.collect(band => {
      const e80Sum = e80Calc(band).sum();
      const l80Sum = l80Calc(band).sum();

      return 10 * safeLog10(e80Sum / l80Sum);
    }),
  octaveBandValues =>
    (octaveBandValues.band(500) + octaveBandValues.band(1000)) / 2
);
