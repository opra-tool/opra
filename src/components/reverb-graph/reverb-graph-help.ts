import { localized, msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@localized()
@customElement('reverb-graph-help')
export class ReverbGraphHelp extends LitElement {
  render() {
    // TODO: translate
    return html`
      <div>
        <p>
          ${msg(html`
            The reverberation time <i>T</i> is defined by ISO 3382-1 as the
            <q
              >duration required for the space-averaged sound energy density in
              an enclosure to decrease by 60 dB after the source emission has
              stopped</q
            >.
          `)}
        </p>

        <p>
          ${msg(html`
            It is usually not possible to measure a drop of 60dB. Often, a drop
            in 20 dB will be measured and extrapolated.
          `)}
        </p>

        <p>
          ${msg(html`
            This implementation measures the drop time it takes for the audio
            signal to drop from -5dB to -25dB. It then uses athe least-squares
            algorithm to fit a linear regression line, which can be used to
            calculate <i>T</i>.
          `)}
        </p>

        <p>
          ${msg(`
          The early decay time is similarly calculated by fitting a line to
          the regression between 0 and -10dB of the original signal.
        `)}
        </p>
      </div>
    `;
  }

  static styles = css``;
}
