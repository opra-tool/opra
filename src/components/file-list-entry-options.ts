import { localized, msg } from '@lit/localize';
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

export class FileListConvertEvent extends CustomEvent<{
  id: string;
}> {
  constructor(id: string) {
    super('convert-file', {
      detail: {
        id,
      },
      bubbles: true,
      composed: true,
    });
  }
}

@localized()
@customElement('file-list-entry-options')
export class FileListEntryOptions extends LitElement {
  @property({ type: String })
  id: string = '';

  @property({ type: String })
  type: 'binaural' | 'mid-side' = 'binaural';

  @property({ type: Boolean })
  converted: boolean = false;

  protected render() {
    return html`
      <sl-dropdown placement="bottom-end">
        <sl-icon-button
          slot="trigger"
          name="three-dots-vertical"
          title=${msg('More options for this impulse response')}
        ></sl-icon-button>
        <sl-menu @sl-select=${this.onMenuSelect}>
          ${this.renderConversionOptions()}
          <sl-divider></sl-divider>
          <sl-menu-item value="remove">${msg('Discard')}</sl-menu-item>
        </sl-menu>
      </sl-dropdown>
    `;
  }

  private renderConversionOptions() {
    if (this.converted && this.type === 'mid-side') {
      return html`
        <sl-menu-item value="convert"> ${msg('Undo conversion')} </sl-menu-item>
      `;
    }

    return this.type === 'binaural'
      ? html`
          <sl-menu-item value="mark:mid-side">
            ${msg('Treat as Mid/Side impulse response')}
          </sl-menu-item>
          <sl-menu-item value="convert">
            ${msg('Convert to Mid/Side impulse response')}
          </sl-menu-item>
        `
      : html`
          <sl-menu-item value="mark:binaural">
            ${msg('Treat as binaural impulse response')}
          </sl-menu-item>
        `;
  }

  private onMenuSelect({
    detail: { item },
  }: CustomEvent<{ item: SlMenuItem }>) {
    const [action, type] = item.value.split(':');

    switch (action) {
      case 'mark':
        if (type !== 'binaural' && type !== 'mid-side') {
          throw new Error('expected type to be one of [binaural, mid-side]');
        }

        this.dispatchEvent(new FileListMarkEvent(this.id, type));
        break;
      case 'convert':
        this.dispatchEvent(new FileListConvertEvent(this.id));
        break;
      case 'remove':
        this.dispatchEvent(new FileListRemoveEvent(this.id));
        break;
      default:
        throw new Error(`unsupported file list entry option '${item.value}'`);
    }
  }
}
