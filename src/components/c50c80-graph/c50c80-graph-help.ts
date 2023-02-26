import { localized, msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { c50C80Formula } from './formulae';

@localized()
@customElement('c50c80-graph-help')
export class C50C80GraphHelp extends LitElement {
  render() {
    // TODO: translate
    return html`
      <div>
        <p>
          <i>C<sub>50</sub></i>
          ${msg(' and ')}
          <i>C<sub>80</sub></i>
          ${msg(
            'describe the balance between early- and late-arriving energy in a signal'
          )}
        </p>

        <p>
          <i>C<sub>50</sub></i>
          ${msg(' is primarily meant for speech, while ')}
          <i>C<sub>80</sub></i>
          ${msg(' is used for music.')}
        </p>

        <p>${msg('It is defined by')}</p>

        ${c50C80Formula}
      </div>
    `;
  }

  static styles = css``;
}
