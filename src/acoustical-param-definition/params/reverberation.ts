import { msg } from '@lit/localize';
import { html } from 'lit';
import { createParam } from '../param';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

export const EARLY_DECAY_TIME_PRESENTATION = createParam({
  id: 'earlyDecayTime',
  symbol: () => 'EDT',
  name: () => msg('Early Decay Time'),
  description: () => msg('Perceived reverberance'),
  unit: 's',
  source: REFERENCE_ISO_3382_1_2009,
});

export const T20_PRESENTATION = createParam({
  id: 't20',
  symbol: () => html`T<sub>20</sub>`,
  name: () => msg('Reverberation Time'),
  description: () => msg('Perceived reverberance'),
  unit: 's',
  source: REFERENCE_ISO_3382_1_2009,
});
