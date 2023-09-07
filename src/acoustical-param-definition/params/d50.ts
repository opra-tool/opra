import { msg } from '@lit/localize';
import { html } from 'lit';
import { createParam } from '../param';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

export const D50_PRESENTATION = createParam({
  id: 'd50',
  name: () => msg('Definition / Deutlichkeit'),
  description: () =>
    html`${msg('Perceived clarity of sound, alternative to')} C<sub>50</sub>`,
  symbol: () => html`D<sub>50</sub>`,
  source: REFERENCE_ISO_3382_1_2009,
});
