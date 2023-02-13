import { localized, msg } from '@lit/localize';
import { SlSwitch } from '@shoelace-style/shoelace';
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ImpulseResponseType } from '../analyzing/impulse-response';
import { formatResponseSummary } from '../presentation/impulse-response-format';

export type FileListEntry = {
  type: ImpulseResponseType;
  id: string;
  fileName: string;
  hasResults: boolean;
  isEnabled: boolean;
  color: string;
  duration: number;
  sampleRate: number;
  error?: string;
};

export class FileListToggleEvent extends CustomEvent<{
  id: string;
}> {
  constructor(id: string) {
    super('toggle-file', {
      detail: {
        id,
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

@localized()
@customElement('file-list')
export class FileList extends LitElement {
  @property({ type: Array })
  entries: FileListEntry[] = [];

  @property({ type: Boolean })
  hideOptions = false;

  protected render() {
    return html`
      <section>${this.entries.map(file => this.renderListEntry(file))}</section>
    `;
  }

  private renderListEntry(entry: FileListEntry) {
    return html`
      <div class="file-list-entry" title=${entry.fileName}>
        <div class="head">${this.renderPrefix(entry)}</div>
        <div>
          <p>${entry.fileName}</p>
          <small>${formatResponseSummary(entry)}</small>
        </div>
        <div class="color" .style=${`background-color: ${entry.color}`}></div>
        ${this.renderFileOptions(entry.type, entry.id)}
      </div>
    `;
  }

  private renderPrefix({ id, isEnabled, error, hasResults }: FileListEntry) {
    if (!hasResults && !error) {
      return html`<sl-spinner></sl-spinner>`;
    }

    if (error) {
      return html`<sl-icon
        title=${error}
        name="exclamation-triangle"
      ></sl-icon>`;
    }

    const cannotToggle = isEnabled && this.getEnabledCount() === 1;

    const toggleTitle = cannotToggle
      ? msg('Cannot deactivate, as this is the only active impulse response')
      : msg('Toggle visibility in graphs');

    return html`<sl-switch
      ?checked=${isEnabled}
      ?disabled=${cannotToggle}
      title=${toggleTitle}
      value=${id}
      @sl-change=${this.onSwitch}
    ></sl-switch>`;
  }

  private renderFileOptions(type: ImpulseResponseType, id: string) {
    if (this.hideOptions) {
      return null;
    }

    if (type === 'monaural') {
      return html`
        <sl-icon-button
          name="trash"
          title=${msg('Discard')}
          @click=${() => this.dispatchEvent(new FileListRemoveEvent(id))}
        ></sl-icon-button>
      `;
    }

    return html`
      <file-list-entry-options
        .id=${id}
        .type=${type}
      ></file-list-entry-options>
    `;
  }

  private onSwitch(ev: CustomEvent) {
    const target = ev.target as SlSwitch;

    this.dispatchEvent(new FileListToggleEvent(target.value));
  }

  private getEnabledCount() {
    return this.entries.reduce(
      (count, file) => (file.isEnabled ? count + 1 : count),
      0
    );
  }

  static styles = css`
    section {
      background: var(--sl-color-neutral-100);
      border-radius: 0.5rem;
      padding: 0.25rem;
      height: 100%;
      box-sizing: border-box;
    }

    .file-list-entry {
      display: grid;
      grid-template-columns: 2.4rem minmax(0, 1fr) auto auto;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
    }

    .file-list-entry:not(:last-child) {
      border-bottom: 1px solid var(--sl-color-neutral-200);
    }

    .file-list-entry p {
      margin: 0;

      overflow: hidden;
      text-overflow: ellipsis;
    }

    .head {
      display: flex;
      justify-content: center;
    }

    sl-switch::part(label) {
      display: none;
      margin: 0;
    }

    .color {
      margin-left: auto;
      width: 1rem;
      height: 1rem;
      border-radius: 999px;
    }
  `;
}
