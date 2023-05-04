import { localized, msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@localized()
@customElement('reverb-graph-help')
export class ReverbGraphHelp extends LitElement {
  render() {
    return html`
      <div>
        <p>
          ${msg(`
            The Reverberation time has been a popular parameter to rate room acoustical impressions for well over a century.
            It describes the time needed, until the sound energy has decreased by 60 dB after the source emission stopped
          `)}
          <source-paper paper="iso3382-1" parenthesis></source-paper>.
        </p>

        <p>
          ${msg(html`
            It is usually infeasible to measure a sound energy decrease of 60
            dB. The reverberation time is thus measured by extrapolating a
            linear regression line fitted to the decrease from -5dB to -25dB.
            The early decay time is similarly calculated using 0 and -10dB to
            fit the regression line.
          `)}
        </p>
      </div>
    `;
  }

  static styles = css`
    p {
      line-height: 1.5;
    }
  `;
}
