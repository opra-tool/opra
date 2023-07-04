import { LitElement, css, html } from 'lit';
import SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import { customElement, query } from 'lit/decorators.js';
import { localized, msg } from '@lit/localize';

@localized()
@customElement('discard-all-dialog')
export class DiscardAllDialog extends LitElement {
  @query('.dialog', true)
  private dialog!: SlDialog;

  protected render() {
    return html`
      <sl-dialog ?open=${false} class="dialog">
        <span slot="label">${msg('Confirmation required')}</span>
        <p>${msg('Are you sure to discard all room impulse responses?')}</p>

        <div class="buttons">
          <sl-button @click=${this.onCancel} type="submit"
            >${msg('No, take me back')}</sl-button
          >
          <sl-button @click=${this.onConfirm} variant="danger" type="submit"
            >${msg('Yes, discard all')}</sl-button
          >
        </div>
      </sl-dialog>
    `;
  }

  public show() {
    this.dialog.show();
  }

  public hide() {
    this.dialog.hide();
  }

  private onConfirm() {
    this.dispatchEvent(new Event('confirm'));
  }

  private onCancel() {
    this.dispatchEvent(new Event('cancel'));
  }

  static styles = css`
    .buttons {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-block-start: 3rem;
    }

    p {
      margin: 0;
    }
  `;
}
