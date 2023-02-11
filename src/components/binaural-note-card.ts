import { localized, msg } from '@lit/localize';
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@localized()
@customElement('binaural-note-card')
export class BinauralNoteCard extends LitElement {
  render() {
    return html` <base-card>
      <section>
        <sl-icon name="exclamation-octagon"></sl-icon>
        <p>
          ${msg(`For binaural room impulse responses, monaural parameters and graphs are
          calculated on the arithmetic mean of the left and right channels. Keep
          in mind that the head-related transfer function might influence these
          results.`)}
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
