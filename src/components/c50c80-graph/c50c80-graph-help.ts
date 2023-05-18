import { localized, msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { c50C80Formula } from './formulae';

const c50 = html`<i>C<sub>50</sub></i>`;
const c80 = html`<i>C<sub>80</sub></i>`;

@localized()
@customElement('c50c80-graph-help')
export class C50C80GraphHelp extends LitElement {
  render() {
    return html`
      <div>
        <p>
          ${msg(html`
            ${c50} and ${c80} describe the balance between early- and
            late-arriving energy in a room impulse response. ${c50} is primarily
            meant to rate speech, while ${c80} is usually used to rate music.
            Both are defined by ISO 3382-1 as
          `)}
          <source-paper paper="iso3382-1" parenthesis></source-paper>:
        </p>

        <math-formula>${c50C80Formula}</math-formula>
      </div>
    `;
  }

  static styles = css`
    p {
      line-height: 1.5;
    }
  `;
}
