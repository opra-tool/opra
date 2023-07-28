import { msg } from '@lit/localize';
import { html } from 'lit';
import { createParam } from '../param';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

export const EARLY_LATERAL_SOUND_LEVEL_PRESENTATION = createParam({
  id: 'earlyLateralSoundLevel',
  name: () => msg('Early Lateral Sound Level'),
  description: () => msg('Listener envelopment (LEV)'),
  symbol: () => html`L<sub>J,early</sub>`,
  unit: 'dB',
  source: REFERENCE_ISO_3382_1_2009,
});

export const LATE_LATERAL_SOUND_LEVEL_PRESENTATION = createParam({
  id: 'lateLateralSoundLevel',
  name: () => msg('Late Lateral Sound Level'),
  description: () => msg('Listener envelopment (LEV)'),
  symbol: () => html`L<sub>J,late</sub>`,
  unit: 'dB',
  source: REFERENCE_ISO_3382_1_2009,
});
