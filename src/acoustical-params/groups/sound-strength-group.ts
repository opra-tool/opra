import { msg } from '@lit/localize';
import { html } from 'lit';
import { AcousticalParamGroupDefinition } from '../group-definition';
import {
  EARLY_SOUND_STRENGTH_PARAMETER,
  LATE_SOUND_STRENGTH_PARAMETER,
  SOUND_STRENGTH_PARAMETER,
} from '../params/sound-strength';
import { REFERENCE_ISO_3382_1_2009 } from '../references';

const soundStrengthFormula = `
G = 10 \\lg{\\frac{
  \\int_{0}^{\\infty}p^{2} \\;dt
  }{
  \\int_{0}^{\\infty}p_{10}^{2} \\;dt
}}`;

export const SOUND_STRENGTH_GROUP: AcousticalParamGroupDefinition = {
  id: 'soundStrength',
  params: [
    SOUND_STRENGTH_PARAMETER,
    EARLY_SOUND_STRENGTH_PARAMETER,
    LATE_SOUND_STRENGTH_PARAMETER,
  ],
  name: () => msg('Sound Strength'),
  description: () => html`
    <div>
      <p>
        ${msg(`
          Sound strength is a measure of the subjective bass level.
          It is defined as the logarithmic ratio between the sound energy of the impulse response to that of another
          response measured at a distance of 10 meters from the sound source.
          The early sound strength is calculated on samples before the 80ms mark, the late sound strength on samples after 80ms.
          ISO 3382-1 defines the sound strength as
        `)}
        <reference-paper
          .paper=${REFERENCE_ISO_3382_1_2009}
          parenthesis
        ></reference-paper
        >:
      </p>

      <math-formula .formula=${soundStrengthFormula}></math-formula>
    </div>
  `,
};
