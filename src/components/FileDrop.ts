import { LitElement, html, css } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

@customElement('file-drop')
export class FileDrop extends LitElement {
  @state()
  private isDraggingOver = false;

  @query('#file-input')
  private fileInput!: HTMLInputElement;

  render() {
    return html`
      <base-card noPadding>
        <div
          class=${classMap({
            'drop-target': true,
            'dragging-over': this.isDraggingOver,
          })}
          @drop=${this.onDrop}
          @dragenter=${this.onDragEnter}
          @dragleave=${this.onDragLeave}
          @dragover=${this.onDragOver}
        >
          <span>Drop a room response file here</span>
          <span>or</span>
          <sl-button @click=${this.onFileUploadButtonCLicked}>
            Choose a file
          </sl-button>
          <input
            id="file-input"
            type="file"
            accept=".wav"
            @change=${this.onFileInputChange}
          />
        </div>
      </base-card>
    `;
  }

  private onDragEnter(ev: DragEvent) {
    ev.preventDefault();

    this.isDraggingOver = true;
  }

  private onDragLeave(ev: DragEvent) {
    ev.preventDefault();

    this.isDraggingOver = false;
  }

  private onDragOver(ev: DragEvent) {
    ev.preventDefault();

    this.isDraggingOver = true;
  }

  private onDrop(ev: DragEvent) {
    ev.preventDefault();

    this.isDraggingOver = false;

    const files = ev.dataTransfer?.files;
    if (!files) {
      return;
    }

    this.dispatchChangeEvent(files);
  }

  private dispatchChangeEvent(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<{ file: File }>('change', {
        detail: {
          file: files[0],
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private onFileInputChange() {
    this.dispatchChangeEvent(this.fileInput.files);
  }

  private onFileUploadButtonCLicked() {
    this.fileInput.click();
  }

  static styles = css`
    .drop-target {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      text-align: center;
    }

    .dragging-over {
      background-color: rgba(255, 255, 255, 0.05);
    }

    #file-input {
      visibility: hidden;
      position: absolute;
    }
  `;
}
