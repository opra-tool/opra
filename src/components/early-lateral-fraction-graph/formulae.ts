import { html } from 'lit';

export const earlyLateralFractionFormula = html`
  <math xmlns="http://www.w3.org/1998/Math/MathML">
    <mstyle displaystyle="true" scriptlevel="0">
      <mrow class="MJX-TeXAtom-ORD">
        <msub>
          <mi>J</mi>
          <mrow class="MJX-TeXAtom-ORD">
            <mi>L</mi>
            <mi>F</mi>
          </mrow>
        </msub>
        <mo>=</mo>
        <mfrac>
          <mrow>
            <msubsup>
              <mo>&#x222B;<!-- ∫ --></mo>
              <mrow class="MJX-TeXAtom-ORD">
                <mn>0</mn>
                <mo>,</mo>
                <mn>005</mn>
              </mrow>
              <mrow class="MJX-TeXAtom-ORD">
                <mn>0</mn>
                <mo>,</mo>
                <mn>080</mn>
              </mrow>
            </msubsup>
            <mrow class="MJX-TeXAtom-ORD">
              <msubsup>
                <mi>p</mi>
                <mrow class="MJX-TeXAtom-ORD">
                  <mi>L</mi>
                </mrow>
                <mrow class="MJX-TeXAtom-ORD">
                  <mn>2</mn>
                </mrow>
              </msubsup>
              <mspace width="thickmathspace" />
              <mi>d</mi>
              <mi>t</mi>
            </mrow>
          </mrow>
          <mrow>
            <msubsup>
              <mo>&#x222B;<!-- ∫ --></mo>
              <mrow class="MJX-TeXAtom-ORD">
                <mn>0</mn>
              </mrow>
              <mrow class="MJX-TeXAtom-ORD">
                <mn>0</mn>
                <mo>,</mo>
                <mn>080</mn>
              </mrow>
            </msubsup>
            <mrow class="MJX-TeXAtom-ORD">
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
          </mrow>
        </mfrac>
      </mrow>
    </mstyle>
  </math>
`;
