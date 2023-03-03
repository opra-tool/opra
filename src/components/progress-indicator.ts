import { localized, msg } from '@lit/localize';
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@localized()
@customElement('progress-indicator')
export class ProgressIndicator extends LitElement {
  render() {
    return html`
      <div>
        <sl-spinner></sl-spinner>
        <p>${msg('Analyzing file(s) ...')}</p>
      </div>
    `;
  }

  static styles = css`
    div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 50vh;
    }

    sl-spinner {
      --track-width: 0.25rem;

      font-size: 4rem;
    }

    p {
      margin-top: 2rem;
    }
  `;
}
