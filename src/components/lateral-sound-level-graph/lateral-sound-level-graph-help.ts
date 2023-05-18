import { localized, msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { lateralSoundLevelFormula } from './formulae';

@localized()
@customElement('lateral-sound-level-graph-help')
export class LateralSoundLevelGraphHelp extends LitElement {
  render() {
    return html`
      <div>
        <p>
          ${msg(`
            The early and late lateral sound level parameters are calculated as a measure of listener envelopment.
            ISO 3382-1 defines them as
          `)}
          <source-paper paper="iso3382-1" parenthesis></source-paper>:
        </p>

        <math-formula>${lateralSoundLevelFormula}</math-formula>
      </div>
    `;
  }

  static styles = css`
    p {
      line-height: 1.5;
    }
  `;
}
