import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('progress-indicator')
export class ProgressIndicator extends LitElement {
  @property()
  message: string = '';

  render() {
    return html`
      <div>
        <sl-spinner></sl-spinner>
        <p>${this.message}</p>
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

declare global {
  interface HTMLElementTagNameMap {
    'progress-indicator': ProgressIndicator;
  }
}
