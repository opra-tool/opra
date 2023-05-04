import { html } from 'lit';

export const soundStrengthFormula = html`
  <math xmlns="http://www.w3.org/1998/Math/MathML">
    <mstyle displaystyle="true" scriptlevel="0">
      <mrow class="MJX-TeXAtom-ORD">
        <mi>G</mi>
        <mo>=</mo>
        <mn>10</mn>
        <mi>lg</mi>
        <mo>&#x2061;<!-- ⁡ --></mo>
        <mrow class="MJX-TeXAtom-ORD">
          <mfrac>
            <mrow>
              <msubsup>
                <mo>&#x222B;<!-- ∫ --></mo>
                <mrow class="MJX-TeXAtom-ORD">
                  <mn>0</mn>
                </mrow>
                <mrow class="MJX-TeXAtom-ORD">
                  <mi mathvariant="normal">&#x221E;<!-- ∞ --></mi>
                </mrow>
              </msubsup>
              <msup>
                <mi>p</mi>
                <mrow class="MJX-TeXAtom-ORD">
                  <mn>2</mn>
                </mrow>
              </msup>
              <mspace width="thickmathspace" />
              <mi>d</mi>
              <mi>t</mi>
            </mrow>
            <mrow>
              <msubsup>
                <mo>&#x222B;<!-- ∫ --></mo>
                <mrow class="MJX-TeXAtom-ORD">
                  <mn>0</mn>
                </mrow>
                <mrow class="MJX-TeXAtom-ORD">
                  <mi mathvariant="normal">&#x221E;<!-- ∞ --></mi>
                </mrow>
              </msubsup>
              <msubsup>
                <mi>p</mi>
                <mrow class="MJX-TeXAtom-ORD">
                  <mn>10</mn>
                </mrow>
                <mrow class="MJX-TeXAtom-ORD">
                  <mn>2</mn>
                </mrow>
              </msubsup>
              <mspace width="thickmathspace" />
              <mi>d</mi>
              <mi>t</mi>
            </mrow>
          </mfrac>
        </mrow>
      </mrow>
    </mstyle>
  </math>
`;
