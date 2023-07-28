import { msg } from '@lit/localize';
import { html } from 'lit';
import { AcousticalParamGroup } from '../param-group';
import { REFERENCE_ISO_3382_1_2009 } from '../references';
import {
  EARLY_LATERAL_SOUND_LEVEL_PRESENTATION,
  LATE_LATERAL_SOUND_LEVEL_PRESENTATION,
} from '../params/lateral-sound-level';

const lateralSoundLevelFormula = `
L_{J} = 10 \\lg{\\left[\\frac{
  \\int_{0.080}^{\\infty}{p_{L}^{2}\\;dt}
  }{
  \\int_{0}^{\\infty}{p_{10}^{2}\\;dt}
}\\right]}\\;\\mathit{dB}`;

export const LATERAL_SOUND_LEVEL_GROUP: AcousticalParamGroup = {
  id: 'lateralSoundLevel',
  params: [
    EARLY_LATERAL_SOUND_LEVEL_PRESENTATION,
    LATE_LATERAL_SOUND_LEVEL_PRESENTATION,
  ],
  name: () => msg('Lateral Sound Level'),
  description: () => html`
    <div>
      <p>
        ${msg(`
          The early and late lateral sound level parameters are calculated as a measure of listener envelopment.
          ISO 3382-1 defines them as
        `)}
        <reference-paper
          .paper=${REFERENCE_ISO_3382_1_2009}
          parenthesis
        ></reference-paper
        >:
      </p>

      <math-formula .formula=${lateralSoundLevelFormula}></math-formula>
    </div>
  `,
};
