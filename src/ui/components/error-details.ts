import { localized, msg } from '@lit/localize';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@localized()
@customElement('error-details')
export class ErrorDetails extends LitElement {
  @property({ type: Object })
  error: Error | null = null;

  protected render() {
    if (!this.error) {
      return null;
    }

    return html`
      <div class="error">
        <sl-icon name="exclamation-octagon"></sl-icon>
        <strong>${msg('An error occured')}</strong>
        <sl-details summary=${msg('Technical details')}>
          <code> ${this.error} </code>
        </sl-details>
      </div>
    `;
  }

  static style = css`
    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 10vh 2rem 2rem 2rem;
      color: var(--sl-color-danger-300);
    }

    .error sl-icon {
      font-size: 4rem;
    }
  `;
}
