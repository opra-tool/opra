import { msg } from '@lit/localize';
import { html } from 'lit';
import { createParam } from '../param';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

export const EARLY_LATERAL_ENERGY_FRACTION_PRESENTATION = createParam({
  id: 'earlyLateralEnergyFraction',
  name: () => msg('Early Lateral Energy Fraction'),
  description: () => msg('Apparent source width (ASW)'),
  symbol: () => html`J<sub>LF</sub>`,
  source: REFERENCE_ISO_3382_1_2009,
});
