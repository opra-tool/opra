import { html } from 'lit';

export const lateralSoundLevelFormula = html`
  <math xmlns="http://www.w3.org/1998/Math/MathML">
    <mstyle displaystyle="true" scriptlevel="0">
      <mrow class="MJX-TeXAtom-ORD">
        <msub>
          <mi>L</mi>
          <mrow class="MJX-TeXAtom-ORD">
            <mi>J</mi>
          </mrow>
        </msub>
        <mo>=</mo>
        <mn>10</mn>
        <mi>lg</mi>
        <mo>&#x2061;<!-- ⁡ --></mo>
        <mrow class="MJX-TeXAtom-ORD">
          <mrow>
            <mo>[</mo>
            <mfrac>
              <mrow>
                <msubsup>
                  <mo>&#x222B;<!-- ∫ --></mo>
                  <mrow class="MJX-TeXAtom-ORD">
                    <mn>0.080</mn>
                  </mrow>
                  <mrow class="MJX-TeXAtom-ORD">
                    <mi mathvariant="normal">&#x221E;<!-- ∞ --></mi>
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
                    <mi mathvariant="normal">&#x221E;<!-- ∞ --></mi>
                  </mrow>
                </msubsup>
                <mrow class="MJX-TeXAtom-ORD">
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
              </mrow>
            </mfrac>
            <mo>]</mo>
          </mrow>
        </mrow>
        <mspace width="thickmathspace" />
        <mrow class="MJX-TeXAtom-ORD">
          <mi class="MJX-tex-mathit" mathvariant="italic">d</mi>
          <mi class="MJX-tex-mathit" mathvariant="italic">B</mi>
        </mrow>
      </mrow>
    </mstyle>
  </math>
`;
