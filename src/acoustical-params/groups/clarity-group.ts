import { msg } from '@lit/localize';
import { html } from 'lit';
import { REFERENCE_ISO_3382_1_2009 } from '../references';
import { AcousticalParamGroupDefinition } from '../group-definition';
import { C50_PARAMETER, C80_PARAMETER } from '../params/c50c80';

const c50C80Formula = `
C_{t_{e}} = 10 \\lg \\frac{
  \\int_{0}^{t_{e}}{p^{2}}\\;dt
}{
  \\int_{t_{e}}^{\\infty}{p^{2}}\\;dt
}`;

export const CLARITY_GROUP: AcousticalParamGroupDefinition = {
  id: 'clarity',
  params: [C50_PARAMETER, C80_PARAMETER],
  name: () => msg('Clarity'),
  description: () => {
    const c50 = html`<i>C<sub>50</sub></i>`;
    const c80 = html`<i>C<sub>80</sub></i>`;

    return html` <div>
      <p>
        ${msg(html`
          ${c50} and ${c80} describe the balance between early- and
          late-arriving energy in a room impulse response. ${c50} is primarily
          meant to rate speech, while ${c80} is usually used to rate music. Both
          are defined by ISO 3382-1 as
        `)}
        <reference-paper
          .paper=${REFERENCE_ISO_3382_1_2009}
          parenthesis
        ></reference-paper
        >:
      </p>

      <math-formula .formula=${c50C80Formula}></math-formula>
    </div>`;
  },
};
