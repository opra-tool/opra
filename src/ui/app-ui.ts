import { localized, msg } from '@lit/localize';
import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { AppLogic } from '../app-logic';
import { AcousticalParamGroupDefinition } from '../acoustical-params/group-definition';
import {
  OctaveBandParamDefinition,
  SingleFigureParamDefinition,
} from '../acoustical-params/param-definition';
import {
  EnvironmentChangeEvent,
  EnvironmentDialog,
} from './environment-dialog';
import { JSONFileExporter } from '../exporter';
import { FileDropChangeEvent } from './components/file-drop';
import { DiscardAllDialog } from './discard-all-dialog';
import { FileListToggleEvent } from './file-list';
import {
  FileListMarkEvent,
  FileListRemoveEvent,
} from './file-list-entry-options';
import { notifySuccess, notifyWarning } from './notifications';
import { RAQI_PARAMETERS } from '../raqi/raqi-data';

const COLOR_WHITE = 'rgba(255, 255, 255, 0.75)';
const COLOR_BLUE = 'rgba(153, 102, 255, 0.5)';
const COLOR_RED = 'rgba(255, 99, 132, 0.5)';
const COLOR_YELLOW = 'rgba(128, 128, 0, 0.5)';
const COLOR_GREEN = 'rgba(93, 163, 153, 0.5)';

const COLORS = [COLOR_WHITE, COLOR_BLUE, COLOR_RED, COLOR_YELLOW, COLOR_GREEN];

const MAX_DISPLAY_COUNT = COLORS.length;

@localized()
@customElement('app-ui')
export class AppUI extends LitElement {
  private appLogic: AppLogic;

  private exporter: JSONFileExporter;

  private enabledFiles = new Map<string, { color: string }>();

  private errors = new Map<string, Error>();

  private singleFigureParams: (
    | SingleFigureParamDefinition
    | OctaveBandParamDefinition
  )[];

  private paramGroups: AcousticalParamGroupDefinition[];

  @state()
  private initialized = false;

  @state()
  private error: Error | null = null;

  @query('.environment-dialog', true)
  private environmentDialog!: EnvironmentDialog;

  @query('.discard-all-dialog', true)
  private discardAllDialog!: DiscardAllDialog;

  constructor(
    params: (SingleFigureParamDefinition | OctaveBandParamDefinition)[],
    paramGroups: AcousticalParamGroupDefinition[],
    appLogic: AppLogic,
    exporter: JSONFileExporter
  ) {
    super();

    this.singleFigureParams = params;
    this.paramGroups = paramGroups;

    this.appLogic = appLogic;
    this.exporter = exporter;

    this.appLogic.addEventListener('initialized', () => {
      this.initialized = true;
    });
    this.appLogic.addEventListener('file-added', ({ id }) =>
      this.onImpulseResponseFileAdded(id)
    );
    this.appLogic.addEventListener('file-changed', () => this.requestUpdate());
    this.appLogic.addEventListener('file-removed', ({ id }) =>
      this.onImpulseResponseFileRemoved(id)
    );
    this.appLogic.addEventListener('results-available', () =>
      this.requestUpdate()
    );
    this.appLogic.addEventListener(
      'file-processing-error',
      ({ id, fileName, error }) => {
        notifyWarning(
          `${fileName} ${msg('ignored')}: ${
            error.message || msg('Unknown error')
          }`
        );
        this.errors.set(id, error);
      }
    );
  }

  protected render() {
    if (!this.initialized) {
      return html`<div class="loading">
        <sl-spinner></sl-spinner>
      </div>`;
    }

    const fileListEntries = this.appLogic
      .getAllImpulseResponseFiles()
      .map(({ type, id, duration, sampleRate, fileName }) => ({
        type,
        id,
        duration,
        isEnabled: this.enabledFiles.has(id),
        color: this.enabledFiles.get(id)?.color,
        sampleRate,
        fileName,
        hasResults: this.appLogic.hasResultsForFile(id),
        error: this.errors.get(id)?.message,
      }));

    const hasFiles = this.appLogic.getAllImpulseResponseFiles().length > 0;

    return html`
      <section class="grid">
        <base-card class="controls-card">
          <section class="files">
            <file-drop
              label=${msg('Drop room impulse response files here')}
              @change=${this.onAudioFilesDropped}
            ></file-drop>
            ${this.appLogic.getAllImpulseResponseFiles().length > 0
              ? html`
                  <file-list
                    .entries=${fileListEntries}
                    .canEnableFiles=${this.enabledFiles.size <
                    MAX_DISPLAY_COUNT}
                    @toggle-file=${this.onToggleFile}
                    @remove-file=${this.onRemoveFile}
                    @mark-file=${this.onMarkFile}
                    @set-environment=${this.onShowEnvironmentDialog}
                  ></file-list>
                `
              : null}
          </section>
          <section class="settings">
            <environment-notice
              @show-dialog=${this.onShowEnvironmentDialog}
            ></environment-notice>
            <sl-button @click=${this.onExport} .disabled=${!hasFiles}>
              <sl-icon slot="prefix" name="download"></sl-icon>
              ${msg('Download Results')}
            </sl-button>
            <sl-button
              @click=${this.onDiscardAllResponses}
              .disabled=${!hasFiles}
            >
              <sl-icon slot="prefix" name="trash"></sl-icon>
              ${msg('Discard all responses')}
            </sl-button>
          </section>
        </base-card>
        ${this.renderResults()}
        <error-details .error=${this.error}></error-details>
      </section>

      ${this.appLogic.getAllImpulseResponseFiles().length > 0
        ? html`<file-dropdown
            .entries=${fileListEntries}
            @toggle-file=${this.onToggleFile}
          ></file-dropdown>`
        : null}

      <environment-dialog
        .values=${this.appLogic.getEnvironmentValues()}
        class="environment-dialog"
        @change=${this.onEnvironmentChange}
      ></environment-dialog>

      <discard-all-dialog
        class="discard-all-dialog"
        @confirm=${this.onDiscardAllResponsesConfirmed}
        @cancel=${() => this.discardAllDialog.hide()}
      ></discard-all-dialog>
    `;
  }

  private renderResults() {
    if (!this.appLogic.getAllImpulseResponseFiles().length) {
      return null;
    }

    const enabledFiles = this.appLogic
      .getAllImpulseResponseFiles()
      .filter(
        r =>
          this.enabledFiles.has(r.id) && this.appLogic.hasResultsForFile(r.id)
      )
      .map(r => ({
        ...r,
        // can coerce type due to previous filter() call
        color: this.enabledFiles.get(r.id)?.color as string,
      }));

    if (!enabledFiles.length) {
      return html`<progress-indicator
        .message=${msg('Analyzing file(s) ...')}
      ></progress-indicator>`;
    }

    const binauralFiles = enabledFiles.filter(
      ({ type }) => type === 'binaural'
    );

    const hasBinauralFiles = binauralFiles.length > 0;

    return html`
      ${hasBinauralFiles
        ? html`<binaural-note-card></binaural-note-card>`
        : null}
      ${this.renderImpulseResponses()} ${this.renderSingleFigureResults()}
      ${this.renderRAQIResults()} ${this.renderOctaveBandResults()}

      <convolver-card
        class=${classMap({ expand: hasBinauralFiles })}
        .responses=${enabledFiles}
      ></convolver-card>
    `;
  }

  private renderImpulseResponses() {
    const files = this.getEnabledFilesWithAssociatedColor();

    const impulseResponses = files
      .filter(file => this.appLogic.getIRSamples(file.id))
      .map(file => ({
        fileColor: file.color,
        sampleRate: file.sampleRate,
        // can use '!' because of previous filter() call
        irSamples: this.appLogic.getIRSamples(file.id)!,
      }));

    return html`<impulse-response-graph
      .impulseResponses=${impulseResponses}
    ></impulse-response-graph>`;
  }

  private renderSingleFigureResults() {
    const files = this.getEnabledFilesWithAssociatedColor();

    const results = this.singleFigureParams.map(param => ({
      id: param.id,
      name: param.name,
      description: param.description,
      source: param.source,
      symbol: param.symbol,
      unit: param.unit,
      irResults: files.map(file => ({
        color: file.color,
        fileName: file.fileName,
        result: this.appLogic.getSingleFigureParamResult(param.id, file.id),
      })),
    }));

    return html`<parameters-card .results=${results}></parameters-card>`;
  }

  private renderRAQIResults() {
    const files = this.getEnabledFilesWithAssociatedColor();

    const results = RAQI_PARAMETERS.map(param => ({
      nameEnglish: param.nameEnglish,
      nameGerman: param.nameGerman,
      irResults: files
        .filter(file => this.appLogic.getRAQIResults(param.id, file.id))
        .map(file => ({
          fileName: file.fileName,
          color: file.color,
          // can use '!' because of previous filter() call
          scorePerStimulus: this.appLogic.getRAQIResults(param.id, file.id)!,
        })),
    }));

    return html`<raqi-card .results=${results}></raqi-card>`;
  }

  private renderOctaveBandResults() {
    const files = this.getEnabledFilesWithAssociatedColor();

    return this.paramGroups.map(group => {
      let unit;

      for (const param of group.params) {
        if (unit !== undefined && param.unit !== unit) {
          throw new Error(
            `a graph is only allowed a single unit on the y-axis. At least two were given (${param.unit}, ${unit})`
          );
        }

        unit = param.unit;
      }

      const params = group.params
        .map(param => ({
          key: param.id,
          label: html`${param.name()}${param.symbol
            ? html`, <i>${param.symbol}</i>`
            : null}` as TemplateResult,
          datasets: files
            .map(file => {
              const lala = this.appLogic.getOctaveBandParamResult(
                param.id,
                file.id
              );

              return {
                id: file.id,
                fileName: file.fileName,
                result: this.appLogic.getOctaveBandParamResult(
                  param.id,
                  file.id
                ),
              };
            })
            .filter(r => r.result)
            .map(r => ({
              // can use '!' because of previous filter() call
              color: this.enabledFiles.get(r.id)!.color,
              // can use '!' because of previous filter() call
              values: r.result!.raw(),
            })),
        }))
        .filter(param => param.datasets.length > 0);

      if (params.length === 0) {
        return null;
      }

      return html`
        <help-card .cardTitle=${group.name()}>
          <octave-bands-graph
            .params=${params}
            .yAxisLabel=${unit || ''}
          ></octave-bands-graph>
          <div slot="help">${group.description()}</div>
        </help-card>
      `;
    });
  }

  private getEnabledFilesWithAssociatedColor() {
    return this.appLogic
      .getAllImpulseResponseFiles()
      .filter(({ id }) => this.enabledFiles.has(id))
      .map(file => {
        // can use '!' because of previous filter() call
        const { color } = this.enabledFiles.get(file.id)!;

        return { ...file, color };
      });
  }

  private onEnvironmentChange({ detail }: EnvironmentChangeEvent) {
    this.appLogic.setEnvironmentValues(detail);
    this.environmentDialog.hide();

    notifySuccess(msg('Successfully set environment values'));
  }

  private onShowEnvironmentDialog() {
    this.environmentDialog.show();
  }

  private onRemoveFile({ detail: { id } }: FileListRemoveEvent) {
    this.appLogic.removeFile(id);
  }

  private onMarkFile({ detail: { id, markAs } }: FileListMarkEvent) {
    this.appLogic.markFileAs(id, markAs);
  }

  private onToggleFile({ detail: { id } }: FileListToggleEvent) {
    if (this.enabledFiles.has(id)) {
      this.enabledFiles.delete(id);
    } else {
      this.enabledFiles.set(id, { color: this.findAvailableColor() });
    }

    this.requestUpdate();
  }

  private onAudioFilesDropped({ detail: { files } }: FileDropChangeEvent) {
    for (let i = 0; i < files.length; i++) {
      this.appLogic.addAudioFile(files[i]);
    }
  }

  private onImpulseResponseFileAdded(id: string) {
    if (this.enabledFiles.size < MAX_DISPLAY_COUNT) {
      this.enabledFiles.set(id, { color: this.findAvailableColor() });
    }

    this.requestUpdate();
  }

  private onImpulseResponseFileRemoved(id: string) {
    this.enabledFiles.delete(id);

    this.requestUpdate();
  }

  private onDiscardAllResponses() {
    this.discardAllDialog.show();
  }

  private onDiscardAllResponsesConfirmed() {
    this.discardAllDialog.hide();
    this.appLogic.removeAllImpulseResponseFiles();
  }

  private onExport() {
    const json = this.exporter.generateExportFile();
    const blob = new Blob([json], {
      type: 'application/json',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `raqi-export-${new Date().toISOString()}.json`;

    link.click();
  }

  private findAvailableColor(): string {
    const takenColors: string[] = [];
    for (const { color } of this.enabledFiles.values()) {
      takenColors.push(color);
    }
    const color = COLORS.find(c => !takenColors.includes(c));

    if (!color) {
      throw new Error(
        `could not find available color takenColors=${takenColors}`
      );
    }

    return color;
  }

  static styles = css`
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10vw 10vh;
    }

    .loading sl-spinner {
      font-size: 3rem;
      --track-width: 0.25rem;
    }

    .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
    }

    .grid > * {
      /* prevent stretching of parent */
      min-width: 0;
    }

    section.files {
      display: grid;
      grid-template-rows: auto;
      gap: 1rem;
    }

    @media screen and (min-width: 40rem) {
      section.files {
        grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr));
      }
    }

    section.settings {
      display: grid;
      grid-template-columns: 1fr min-content min-content;
      gap: 1rem;
      margin-block-start: 1rem;
    }

    .controls-card,
    binaural-note-card,
    impulse-response-graph,
    parameters-card,
    raqi-card {
      grid-column: 1 / -1;
    }

    /* allow stretching to full width if on its own row */
    convolver-card.expand {
      grid-column: 1 / -1;
    }

    /* allow stretching to full width */
    progress-indicator {
      grid-column: 1 / -1;
    }
  `;
}
