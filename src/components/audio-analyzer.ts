import { LitElement, html, css } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { localized, msg, str } from '@lit/localize';
import { Exporter } from '../export-import/exporter';
import { Analyzer, MaximumFileCountReachedError } from '../analyzing/analyzer';
import { UNIT_CELCIUS } from '../presentation/units';
import { FileListToggleEvent, FileListRemoveEvent } from './file-list';
import { FileListMarkEvent } from './file-list-entry-options';
import { BinauralResults } from '../analyzing/binaural-processing';
import { MonauralResults } from '../analyzing/monaural-processing';
import { MidSideResults } from '../analyzing/mid-side-processing';
import { FileDropChangeEvent } from './file-drop';
import { P0SettingChangeEvent } from './p0-setting';
import { P0Dialog, P0DialogChangeEvent } from './p0-dialog';
import { mapArrayParam } from '../arrays';
import { toastSuccess, toastWarning } from './toast';
import { P0_VAR } from '../presentation/p0-format';
import { meanDecibel } from '../math/decibels';

type Results = MonauralResults | BinauralResults | MidSideResults;

/**
 * @deprecated
 */
function isBinauralResults(results: Results): results is BinauralResults {
  return (results as BinauralResults).iaccBands !== undefined;
}

/**
 * @deprecated
 */
function isMidSideResults(results: Results): results is MidSideResults {
  return (
    (results as MidSideResults).earlyLateralEnergyFractionBands !== undefined
  );
}

@localized()
@customElement('audio-analyzer')
export class AudioAnalyzer extends LitElement {
  private analyzer = new Analyzer();

  private exporter = new Exporter(this.analyzer);

  private hiddenResponses = new Map<string, true>();

  private errors = new Map<string, Error>();

  @state()
  private error: Error | null = null;

  @query('.p0-dialog', true)
  private p0Dialog!: P0Dialog;

  constructor() {
    super();

    this.analyzer.addEventListener('change', () => this.requestUpdate());
    this.analyzer.addEventListener(
      'file-adding-error',
      ({ fileName, error }) => {
        toastWarning(
          `${fileName} ${msg('ignored')}: ${
            error.message || msg('Unknown error')
          }`
        );
      }
    );

    this.analyzer.addEventListener(
      'file-processing-error',
      ({ id, fileName, error }) => {
        toastWarning(
          `${fileName} ${msg('ignored')}: ${
            error.message || msg('Unknown error')
          }`
        );
        this.errors.set(id, error);
      }
    );

    this.analyzer.addEventListener(
      'p0-air-values-update',
      ({ p0, temperature, humidity }) =>
        toastSuccess(
          html`${msg('Successfully set')} ${P0_VAR} = ${p0},
          ${temperature}${UNIT_CELCIUS}, ${humidity}%`
        )
    );
  }

  protected render() {
    const fileListEntries = this.analyzer
      .getResponses()
      .map(({ type, id, color, duration, sampleRate, fileName }) => ({
        type,
        id,
        color,
        duration,
        isEnabled: !this.hiddenResponses.has(id),
        sampleRate,
        fileName,
        hasResults: this.analyzer.hasResults(id),
        error: this.errors.get(id),
      }));

    return html`
      <section class="grid">
        <base-card class="controls-card">
          <section class="files">
            <file-drop
              label=${msg('Drop room impulse response files here')}
              @change=${this.onFilesAdded}
            ></file-drop>
            ${this.analyzer.getResponses().length > 0
              ? html`
                  <file-list
                    .entries=${fileListEntries}
                    @toggle-file=${this.onToggleFile}
                    @remove-file=${this.onRemoveFile}
                    @mark-file=${this.onMarkFile}
                  ></file-list>
                `
              : null}
          </section>
          <section class="settings">
            <p0-setting
              .p0=${this.analyzer.getP0()}
              @change=${this.onP0SettingChange}
            ></p0-setting>
            <sl-button @click=${this.onExport}>
              <sl-icon slot="prefix" name="download"></sl-icon>
              ${msg('Download Results')}
            </sl-button>
          </section>
        </base-card>
        ${this.renderResults()}
        <error-details .error=${this.error}></error-details>
      </section>

      ${this.analyzer.getResponses().length > 0
        ? html`<file-dropdown
            .entries=${fileListEntries}
            @toggle-file=${this.onToggleFile}
            @remove-file=${this.onRemoveFile}
            @mark-file=${this.onMarkFile}
          ></file-dropdown>`
        : null}

      <p0-dialog
        .p0=${this.analyzer.getP0()}
        relativeHumidity=${this.analyzer.getRelativeHumidity()}
        temperature=${this.analyzer.getAirTemperature()}
        class="p0-dialog"
        @change=${this.onP0DialogChange}
      ></p0-dialog>
    `;
  }

  private renderResults() {
    if (!this.analyzer.getResponses().length) {
      return null;
    }

    const responses = this.analyzer
      .getResponses()
      .filter(
        r => !this.hiddenResponses.has(r.id) && this.analyzer.hasResults(r.id)
      );

    if (!responses.length) {
      return html`<progress-indicator></progress-indicator>`;
    }

    const results = responses.map(r => this.analyzer.getResultsOrThrow(r.id));

    // monaural
    const edt = mapArrayParam(results, 'edtBands');
    const reverbTimeBands = mapArrayParam(results, 'reverbTimeBands');
    const c50 = mapArrayParam(results, 'c50Bands');
    const c80 = mapArrayParam(results, 'c80Bands');
    const squaredIRPoints = mapArrayParam(results, 'squaredIRPoints');
    const centreTimes = mapArrayParam(results, 'centreTime');
    const bassRatios = mapArrayParam(results, 'bassRatio');
    const meanC80s = c80.map(value => meanDecibel(value[3], value[4]));
    const reverbTimes = reverbTimeBands.map(value => (value[3] + value[4]) / 2);

    // binaural
    const binauralResponses = responses.filter(
      ({ type }) => type === 'binaural'
    );
    const binauralResults = results.filter(isBinauralResults);
    const iaccs = results.map(r => {
      if (isBinauralResults(r)) {
        return r.iacc;
      }

      return null;
    });
    const iaccBands = mapArrayParam(binauralResults, 'iaccBands');
    const eiaccBands = mapArrayParam(binauralResults, 'eiaccBands');

    // mid/side
    const midSideResponses = responses.filter(
      ({ type }) => type === 'mid-side'
    );
    const midSideResults = results.filter(isMidSideResults);
    const earlyLateralEnergyFractionBands = mapArrayParam(
      midSideResults,
      'earlyLateralEnergyFractionBands'
    );
    const lateralLevelBands = midSideResponses.map(r =>
      this.analyzer.getLateralLevelResults(r.id)
    );
    const lateLateralLevels = responses
      .map(r => this.analyzer.getLateralLevelResults(r.id))
      .map(v => (v ? v.lateLateralLevel : null));
    const earlyLateralEnergyFractions = results.map(r => {
      if (isMidSideResults(r)) {
        return r.earlyLateralEnergyFraction;
      }

      return null;
    });

    // strengths
    const strengths = responses.map(r =>
      this.analyzer.getStrengthResults(r.id)
    );

    const hasBinauralResults = binauralResults.length > 0;
    const hasMidSideResults = midSideResults.length > 0;

    return html`
      ${hasBinauralResults
        ? html`<binaural-note-card></binaural-note-card>`
        : null}
      <impulse-response-graph
        .impulseResponses=${responses}
        .squaredIRPoints=${squaredIRPoints}
      ></impulse-response-graph>

      <parameters-card
        .impulseResponses=${responses}
        .centreTimes=${centreTimes}
        .bassRatios=${bassRatios}
        .c80s=${meanC80s}
        .reverbTimes=${reverbTimes}
        .iaccs=${iaccs}
        .strengths=${strengths}
        .lateLateralLevels=${lateLateralLevels}
        .earlyLateralEnergyFractions=${earlyLateralEnergyFractions}
      >
        <p0-notice
          .p0=${this.analyzer.getP0()}
          .temperature=${this.analyzer.getAirTemperature()}
          .relativeHumidity=${this.analyzer.getRelativeHumidity()}
          @show-p0-dialog=${this.onShowP0Dialog}
        ></p0-notice>
      </parameters-card>

      <reverb-graph
        .impulseResponses=${responses}
        .edt=${edt}
        .reverbTime=${reverbTimeBands}
      ></reverb-graph>

      <c50c80-graph
        .impulseResponses=${responses}
        .c50=${c50}
        .c80=${c80}
      ></c50c80-graph>

      <strengths-card
        .p0=${this.analyzer.getP0()}
        .impulseResponses=${responses}
        .strengths=${strengths}
      >
        <p0-notice
          slot="p0-notice"
          .p0=${this.analyzer.getP0()}
          .temperature=${this.analyzer.getAirTemperature()}
          .relativeHumidity=${this.analyzer.getRelativeHumidity()}
          @show-p0-dialog=${this.onShowP0Dialog}
        ></p0-notice>
        <p0-setting
          slot="p0-setting"
          .p0=${this.analyzer.getP0()}
          @change=${this.onP0SettingChange}
        ></p0-setting>
      </strengths-card>

      ${hasMidSideResults
        ? html`
            <lateral-level-card
              .p0=${this.analyzer.getP0()}
              .impulseResponses=${midSideResponses}
              .lateralLevels=${lateralLevelBands}
            >
              <p0-notice
                slot="p0-notice"
                .p0=${this.analyzer.getP0()}
                .temperature=${this.analyzer.getAirTemperature()}
                .relativeHumidity=${this.analyzer.getRelativeHumidity()}
                @show-p0-dialog=${this.onShowP0Dialog}
              ></p0-notice>
              <p0-setting
                slot="p0-setting"
                .p0=${this.analyzer.getP0()}
                @change=${this.onP0SettingChange}
              ></p0-setting>
            </lateral-level-card>
            <early-lateral-fraction-graph
              .impulseResponses=${midSideResponses}
              .earlyLateralEnergyFraction=${earlyLateralEnergyFractionBands}
            ></early-lateral-fraction-graph>
          `
        : null}
      ${hasBinauralResults
        ? html`<iacc-graph
            .impulseResponses=${binauralResponses}
            .iacc=${iaccBands}
            .eiacc=${eiaccBands}
          ></iacc-graph>`
        : null}

      <convolver-card
        class=${classMap({ expand: hasBinauralResults })}
        .responses=${responses}
      ></convolver-card>
    `;
  }

  private onP0SettingChange({ detail: { p0 } }: P0SettingChangeEvent) {
    this.analyzer.setP0(p0);

    this.p0Dialog.hide();
  }

  private onP0DialogChange({
    detail: { p0, relativeHumidity, temperature },
  }: P0DialogChangeEvent) {
    this.analyzer.setP0AndAirValues(p0, temperature, relativeHumidity);

    this.p0Dialog.hide();
  }

  private onShowP0Dialog() {
    this.p0Dialog.show();
  }

  private onRemoveFile({ detail: { id } }: FileListRemoveEvent) {
    this.analyzer.removeResponse(id);
  }

  private onMarkFile({ detail: { id, markAs } }: FileListMarkEvent) {
    this.analyzer.markResponseAs(id, markAs);
  }

  private onToggleFile({ detail: { id } }: FileListToggleEvent) {
    if (this.hiddenResponses.has(id)) {
      this.hiddenResponses.delete(id);
    } else {
      this.hiddenResponses.set(id, true);
    }

    this.requestUpdate();
  }

  private async onFilesAdded({ detail: { files } }: FileDropChangeEvent) {
    try {
      await this.analyzer.addResponseFiles(files);
    } catch (err) {
      if (err instanceof MaximumFileCountReachedError) {
        toastWarning(
          msg(
            str`Maximum file count (${err.maxFileCount}) reached. Skipped ${err.skippedFileCount} files.`
          )
        );
      } else {
        throw err;
      }
    }
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

  static styles = css`
    .grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
      margin-block-end: 2.5rem;
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
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-block-start: 1rem;
    }

    .controls-card,
    binaural-note-card,
    impulse-response-graph,
    parameters-card {
      grid-column: 1 / -1;
    }

    /* allow stretching to full width if on its own row */
    convolver-card.expand {
      grid-column: 1 / -1;
    }
  `;
}
