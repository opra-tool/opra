import { msg } from '@lit/localize';
import { html } from 'lit';
import { createParam } from '../param';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

export const C50_PRESENTATION = createParam({
  id: 'c50',
  name: () => msg('Clarity'),
  description: () => msg('Perceived clarity of sound, primarily speech'),
  unit: 'dB',
  symbol: () => html`C<sub>50</sub>`,
  source: REFERENCE_ISO_3382_1_2009,
});

export const C80_PRESENTATION = createParam({
  id: 'c80',
  name: () => msg('Clarity'),
  description: () => msg('Perceived clarity of sound, primarily music'),
  symbol: () => html`C<sub>80</sub>`,
  unit: 'dB',
  source: REFERENCE_ISO_3382_1_2009,
});
