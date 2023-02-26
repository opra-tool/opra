import { html } from 'lit';

export const c50C80Formula = html`
  <math xmlns="http://www.w3.org/1998/Math/MathML">
    <mstyle displaystyle="true">
      <mrow class="MJX-TeXAtom-ORD">
        <mrow class="MJX-TeXAtom-OP">
          <msub>
            <mi mathvariant="normal">C</mi>
            <mrow class="MJX-TeXAtom-ORD">
              <msub>
                <mi mathvariant="normal">t</mi>
                <mrow class="MJX-TeXAtom-ORD">
                  <mi mathvariant="normal">e</mi>
                </mrow>
              </msub>
            </mrow>
          </msub>
        </mrow>
        <mo>=</mo>
        <mn>10</mn>
        <mo>&#x22C5;<!-- ⋅ --></mo>
        <mi>lg</mi>
        <mo>&#x2061;<!-- ⁡ --></mo>
        <mfrac>
          <mrow>
            <munderover>
              <mo>&#x222B;<!-- ∫ --></mo>
              <mrow class="MJX-TeXAtom-ORD">
                <mn>0</mn>
              </mrow>
              <mrow class="MJX-TeXAtom-ORD">
                <msub>
                  <mi>t</mi>
                  <mrow class="MJX-TeXAtom-ORD">
                    <mi>e</mi>
                  </mrow>
                </msub>
              </mrow>
            </munderover>
            <mrow class="MJX-TeXAtom-ORD">
              <msup>
                <mi>p</mi>
                <mrow class="MJX-TeXAtom-ORD">
                  <mn>2</mn>
                </mrow>
              </msup>
              <mo stretchy="false">(</mo>
              <mi>t</mi>
              <mo stretchy="false">)</mo>
            </mrow>
            <mspace width="thickmathspace" />
            <mi>d</mi>
            <mi>t</mi>
          </mrow>
          <mrow>
            <munderover>
              <mo>&#x222B;<!-- ∫ --></mo>
              <mrow class="MJX-TeXAtom-ORD">
                <msub>
                  <mi>t</mi>
                  <mrow class="MJX-TeXAtom-ORD">
                    <mi>e</mi>
                  </mrow>
                </msub>
              </mrow>
              <mrow class="MJX-TeXAtom-ORD">
                <mi mathvariant="normal">&#x221E;<!-- ∞ --></mi>
              </mrow>
            </munderover>
            <mrow class="MJX-TeXAtom-ORD">
              <msup>
                <mi>p</mi>
                <mrow class="MJX-TeXAtom-ORD">
                  <mn>2</mn>
                </mrow>
              </msup>
              <mo stretchy="false">(</mo>
              <mi>t</mi>
              <mo stretchy="false">)</mo>
            </mrow>
            <mspace width="thickmathspace" />
            <mi>d</mi>
            <mi>t</mi>
          </mrow>
        </mfrac>
      </mrow>
    </mstyle>
  </math>
`;
