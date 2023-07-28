import { msg } from '@lit/localize';
import { html } from 'lit';
import { AcousticalParamGroup } from '../param-group';
import { REFERENCE_ISO_3382_1_2009 } from '../references';
import { IACC_PRESENTATION, EARLY_IACC_PRESENTATION } from '../params/iacc';

const iaccFormula = `
\\mathit{IACC} = \\max\\left|\\frac{
  \\int\\limits_{t_{1}}^{t_{2}}{
    p_{l}(t) \\bullet p_{r}(t + \\tau)
  }\\;dt
}{
  \\sqrt{
    \\int\\limits_{t_{1}}^{t_{2}}{p_{l}^{2}(t)}\\;dt
    \\int\\limits_{t_{1}}^{t_{2}}{p_{r}^{2}(t)}\\;dt
  }
}\\right|`;

export const IACC_GROUP: AcousticalParamGroup = {
  id: 'iacc',
  params: [IACC_PRESENTATION, EARLY_IACC_PRESENTATION],
  name: () => msg('Interaural Cross Correlation'),
  description: () => html`
    <div>
      <p>
        ${msg(`
          The interaural cross correlation (IACC) is calculated for binaural room impulse responses.
          These are recorded using an artificial head that simulates the characteristic reflections of the auricle.
          The IACC measures the difference between the impulse response at the right ear and that at the left ear.
          To capture early reflections, the early IACC is calculated over the first 80ms of the impulse response.
          Both are defined by ISO 3382-1 using the interaural cross correlation function (IACF)
        `)}
        <reference-paper
          .paper=${REFERENCE_ISO_3382_1_2009}
          parenthesis
        ></reference-paper
        >:
      </p>

      <math-formula .formula=${iaccFormula}></math-formula>
    </div>
  `,
};
