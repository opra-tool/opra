import { msg } from '@lit/localize';
import { html } from 'lit';
import { AcousticalParamGroupDefinition } from '../group-definition';
import {
  EARLY_LATERAL_SOUND_LEVEL_PARAMETER,
  LATE_LATERAL_SOUND_LEVEL_PARAMETER,
} from '../params/lateral-sound-level';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

const lateralSoundLevelFormula = `
L_{J} = 10 \\lg{\\left[\\frac{
  \\int_{0.080}^{\\infty}{p_{L}^{2}\\;dt}
  }{
  \\int_{0}^{\\infty}{p_{10}^{2}\\;dt}
}\\right]}\\;\\mathit{dB}`;

export const LATERAL_SOUND_LEVEL_GROUP: AcousticalParamGroupDefinition = {
  id: 'lateralSoundLevel',
  params: [
    EARLY_LATERAL_SOUND_LEVEL_PARAMETER,
    LATE_LATERAL_SOUND_LEVEL_PARAMETER,
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
