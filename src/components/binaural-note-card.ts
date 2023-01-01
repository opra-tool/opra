import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('binaural-note-card')
export class BinauralNoteCard extends LitElement {
  render() {
    return html` <base-card>
      <section>
        <sl-icon name="exclamation-octagon"></sl-icon>
        <p>
          For binaural room responses, monaural parameters and graphs are
          calculated on the arithmetic mean of the left and right channels. Keep
          in mind that the head-related transfer function might influence these
          results.
        </p>
      </section>
    </base-card>`;
  }

  static styles = css`
    section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    p {
      margin: 0;
    }

    sl-icon {
      font-size: 2rem;
    }
  `;
}
