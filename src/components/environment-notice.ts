import { localized, msg } from '@lit/localize';
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@localized()
@customElement('environment-notice')
export class EnvironmentNotice extends LitElement {
  protected render() {
    return html` <div class="environment-notice">
      <p>
        ${msg(
          'Environment values are assumed for sound strength and related parameters.'
        )}
      </p>
      <sl-button @click=${() => this.dispatchEvent(new Event('show-dialog'))}>
        ${msg('Show and set environment values')}
      </sl-button>
    </div>`;
  }

  static styles = css`
    .environment-notice {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: var(--sl-color-neutral-700);
    }

    p {
      margin: 0;
    }
  `;
}
