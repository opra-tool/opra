import { LitElement, html, css } from 'lit';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';

export class ProgressIndicator extends LitElement {
  render() {
    return html`
      <div>
        <sl-spinner></sl-spinner>
        <p>Analyzing file ...</p>
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
      font-size: 4rem;
    }

    p {
      margin-top: 2rem;
    }
  `;
}
