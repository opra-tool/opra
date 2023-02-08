import { SlMenuItem } from '@shoelace-style/shoelace';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { FileListRemoveEvent } from './file-list';

export class FileListMarkEvent extends CustomEvent<{
  id: string;
  markAs: 'binaural' | 'mid-side';
}> {
  constructor(id: string, markAs: 'binaural' | 'mid-side') {
    super('mark-file', {
      detail: {
        id,
        markAs,
      },
      bubbles: true,
      composed: true,
    });
  }
}

@customElement('file-list-entry-options')
export class FileListEntryOptions extends LitElement {
  @property({ type: String })
  id: string = '';

  @property({ type: String })
  type: 'binaural' | 'mid-side' = 'binaural';

  protected render() {
    return html`
      <sl-dropdown placement="bottom-end">
        <sl-icon-button
          slot="trigger"
          name="three-dots-vertical"
          title="More Options"
        ></sl-icon-button>
        <sl-menu @sl-select=${this.onMenuSelect}>
          ${this.type === 'binaural'
            ? html`
                <sl-menu-item value="mid-side">
                  Mark as Mid / Side
                </sl-menu-item>
              `
            : html`
                <sl-menu-item value="binaural"> Mark as Binaural </sl-menu-item>
              `}
          <sl-divider></sl-divider>
          <sl-menu-item value="remove">Discard</sl-menu-item>
        </sl-menu>
      </sl-dropdown>
    `;
  }

  private onMenuSelect({
    detail: { item },
  }: CustomEvent<{ item: SlMenuItem }>) {
    switch (item.value) {
      case 'mid-side':
      case 'binaural':
        this.dispatchEvent(new FileListMarkEvent(this.id, item.value));
        break;
      case 'remove':
        this.dispatchEvent(new FileListRemoveEvent(this.id));
        break;
      default:
        throw new Error(`unsupported file list entry option '${item.value}'`);
    }
  }
}
