import { msg } from '@lit/localize';
import { html } from 'lit';
import { REFERENCE_ISO_3382_1_2009 } from '../references';
import { AcousticalParamGroupDefinition } from '../group-definition';
import { EARLY_LATERAL_ENERGY_FRACTION_PARAMETER } from '../params/early-lateral-energy-fraction';

const earlyLateralFractionFormula = `
J_{LF} = \\frac{
  \\int_{0,005}^{0,080}{p_{L}^{2}\\;dt}
  }{
  \\int_{0}^{0,080}{p^{2}\\;dt}
}`;

export const EARLY_LATERAL_ENERGY_FRACTION_GROUP: AcousticalParamGroupDefinition =
  {
    id: 'earlyLateralEnergyFraction',
    params: [EARLY_LATERAL_ENERGY_FRACTION_PARAMETER],
    name: () => msg('Early lateral energy fraction'),
    description: () => html`
      <div>
        <p>
          ${msg(`
          The early lateral energy fraction is a measure of the apparent source width of a room impulse response.
          ISO 3382-1 defines it as
        `)}
          <reference-paper
            .paper=${REFERENCE_ISO_3382_1_2009}
            parenthesis
          ></reference-paper
          >:
        </p>

        <math-formula .formula=${earlyLateralFractionFormula}></math-formula>
      </div>
    `,
  };
