import { localized, msg } from '@lit/localize';
import { SlMenuItem } from '@shoelace-style/shoelace';
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

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

export class FileListRemoveEvent extends CustomEvent<{
  id: string;
}> {
  constructor(id: string) {
    super('remove-file', {
      detail: {
        id,
      },
      bubbles: true,
      composed: true,
    });
  }
}

export class FileListSetEnvironmentEvent extends CustomEvent<{
  id: string;
}> {
  constructor(id: string) {
    super('set-environment', {
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
  type: 'omnidirectional' | 'binaural' | 'mid-side' = 'binaural';

  protected render() {
    return html`
      <sl-dropdown placement="bottom-end">
        <sl-icon-button
          slot="trigger"
          name="three-dots-vertical"
          title=${msg('More options for this impulse response')}
        ></sl-icon-button>
        <sl-menu @sl-select=${this.onMenuSelect}>
          <sl-menu-item value="set-environment">
            ${msg('Set environment values')}
          </sl-menu-item>
          ${this.renderConversionOptions()}
          <sl-divider></sl-divider>
          <sl-menu-item value="remove">${msg('Discard')}</sl-menu-item>
        </sl-menu>
      </sl-dropdown>
    `;
  }

  private renderConversionOptions() {
    if (this.type === 'omnidirectional') {
      return null;
    }

    return this.type === 'binaural'
      ? html`
          <sl-menu-item value="mark:mid-side">
            ${msg('Treat as Mid/Side impulse response')}
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
      case 'set-environment':
        this.dispatchEvent(new FileListSetEnvironmentEvent(this.id));
        break;
      case 'remove':
        this.dispatchEvent(new FileListRemoveEvent(this.id));
        break;
      default:
        throw new Error(`unsupported file list entry option '${item.value}'`);
    }
  }
}
