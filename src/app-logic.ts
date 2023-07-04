import initWasm from 'wasm-raqi-online-toolbox';
import {
  OctaveBandParamDefinition,
  SingleFigureParamDefinition,
} from './acoustical-params/param-definition';
import { readAudioFile } from './audio-files/audio-file-reading';
import { EventEmitter } from './event-emitter';
import { ImpulseResponseFile } from './transfer-objects/impulse-response-file';
import { OctaveBandValues } from './transfer-objects/octave-bands';
import { Persistence } from './persistence';
import { EnvironmentValues } from './transfer-objects/environment-values';
import { analyzeFile } from './acoustical-params-analyzing/file-analyzing';
import { calcRAQIScore } from './raqi/raqi-calculation';
import { RAQI_PARAMETERS } from './raqi/raqi-data';
import { CustomAudioBuffer } from './transfer-objects/audio-buffer';
import { calculateLpe10 } from './acoustical-params-analyzing/lpe10';
import { IRSource } from './acoustical-params-analyzing/source';

const DEFAULT_RELATIVE_HUMIDITY = 50;
const DEFAULT_AIR_TEMPERATURE = 20;
const DEFAULT_DISTANCE_FROM_SOURCE = 10;
const DEFAULT_AIR_DENSITY = 1.2;

type EventMap = {
  initialized: {};
  'file-added': { id: string };
  'file-changed': { id: string };
  'file-removed': { id: string };
  'file-processing-error': { id: string; fileName: string; error: Error };
  'results-available': { id: string };
};

type RAQIResults = {
  paramId: string;
  scorePerStimulus: Record<string, number>;
}[];

export class AppLogic extends EventEmitter<EventMap> {
  private persistence: Persistence;

  private environmentValues: EnvironmentValues = {
    airTemperature: DEFAULT_AIR_TEMPERATURE,
    relativeHumidity: DEFAULT_RELATIVE_HUMIDITY,
    distanceFromSource: DEFAULT_DISTANCE_FROM_SOURCE,
    airDensity: DEFAULT_AIR_DENSITY,
  };

  private acousticalParams: (
    | SingleFigureParamDefinition
    | OctaveBandParamDefinition
  )[];

  private results = new Map<
    string,
    {
      paramId: string;
      singleFigure: number;
      octaveBandValues?: OctaveBandValues;
    }[]
  >();

  private raqiResults = new Map<string, RAQIResults>();

  private files = new Map<string, ImpulseResponseFile>();

  private irSamples = new Map<string, Float32Array>();

  constructor(
    acousticalParams: (
      | SingleFigureParamDefinition
      | OctaveBandParamDefinition
    )[]
  ) {
    super();

    this.acousticalParams = acousticalParams;
    this.persistence = new Persistence();
  }

  async init() {
    await initWasm();

    await this.persistence.init();

    const storedFiles = await this.persistence.getFiles();

    const environment = await this.persistence.getEnvironmentValues();
    if (environment) {
      this.environmentValues = environment;
    }

    for (const file of storedFiles) {
      this.addImpulseResponseFile(file);
    }

    this.dispatchEvent('initialized', {});
  }

  getAcousticalParamDefinition(
    id: string
  ): SingleFigureParamDefinition | OctaveBandParamDefinition {
    const param = this.acousticalParams.find(p => p.id === id);

    if (!param) {
      throw new Error(`expected to find param definition ${id}`);
    }

    return param;
  }

  getSingleFigureParamResult(
    paramId: string,
    fileId: string
  ): number | undefined {
    return this.results.get(fileId)?.find(r => r.paramId === paramId)
      ?.singleFigure;
  }

  getOctaveBandParamResult(
    paramId: string,
    fileId: string
  ): OctaveBandValues | undefined {
    return this.results.get(fileId)?.find(r => r.paramId === paramId)
      ?.octaveBandValues;
  }

  getRAQIResults(
    paramId: string,
    fileId: string
  ): Record<string, number> | undefined {
    return this.raqiResults.get(fileId)?.find(r => r.paramId === paramId)
      ?.scorePerStimulus;
  }

  getEnvironmentValues(): EnvironmentValues {
    return this.environmentValues;
  }

  setEnvironmentValues(values: EnvironmentValues) {
    this.environmentValues = values;

    setTimeout(() => {
      this.recalculateEnvironmentBasedParams();

      this.persistence.saveEnvironmentValues(values);
    }, 0);
  }

  getIRSamples(fileId: string): Float32Array | undefined {
    return this.irSamples.get(fileId);
  }

  getAllImpulseResponseFiles(): ImpulseResponseFile[] {
    return Array.from(this.files.values());
  }

  async addAudioFile(audioFile: File): Promise<void> {
    const buffer = await readAudioFile(audioFile);

    if (buffer.numberOfChannels < 1 || buffer.numberOfChannels > 2) {
      throw new Error(`unsupported channel count: ${buffer.numberOfChannels}`);
    }

    let id;
    do {
      id = randomId();
    } while (this.files.has(id));

    this.addImpulseResponseFile({
      type: buffer.numberOfChannels === 1 ? 'monaural' : 'binaural',
      id,
      fileName: audioFile.name,
      buffer,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
    });
  }

  markFileAs(fileId: string, markAsType: 'binaural' | 'mid-side') {
    const file = this.files.get(fileId);

    if (!file) {
      throw new Error(
        `expected to find impulse response file with id '${fileId}' to mark as '${markAsType}'`
      );
    }

    const newFile = {
      ...file,
      type: markAsType,
    };

    this.files.set(fileId, newFile);

    this.results.delete(fileId);
    this.analyzeFile(this.acousticalParams, newFile);
    this.persistence.saveResponse(newFile);

    this.dispatchEvent('file-changed', { id: fileId });
  }

  removeAllImpulseResponseFiles() {
    for (const id of this.files.keys()) {
      this.removeFile(id);
    }
  }

  removeFile(fileId: string) {
    this.files.delete(fileId);

    this.results.delete(fileId);
    this.persistence.deleteResponse(fileId);

    this.dispatchEvent('file-removed', { id: fileId });
  }

  hasResultsForFile(fileId: string): boolean {
    return this.results.has(fileId);
  }

  private addImpulseResponseFile(file: ImpulseResponseFile) {
    this.files.set(file.id, file);

    this.analyzeFile(this.acousticalParams, file);
    this.persistence.saveResponse(file);

    this.dispatchEvent('file-added', { id: file.id });
  }

  private async analyzeFile(
    params: (SingleFigureParamDefinition | OctaveBandParamDefinition)[],
    file: ImpulseResponseFile
  ) {
    try {
      const previousResults = this.results.get(file.id) || [];

      const buffer = CustomAudioBuffer.fromNativeAudioBuffer(file.buffer);
      const lpe10 = await calculateLpe10(buffer, this.environmentValues);
      const source = await IRSource.create(file.type, buffer);

      const fileResults = await analyzeFile(params)(
        file.type,
        source,
        lpe10,
        previousResults
      );

      this.results.set(file.id, fileResults);

      this.irSamples.set(file.id, source.squaredIR);

      this.raqiResults.set(
        file.id,
        RAQI_PARAMETERS.map(param =>
          calcRAQIScore(param, file.type, fileResults)
        )
      );

      this.dispatchEvent('results-available', { id: file.id });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      if (err instanceof Error) {
        this.dispatchEvent('file-processing-error', {
          id: file.id,
          fileName: file.fileName,
          error: err,
        });
      }
    }
  }

  private async recalculateEnvironmentBasedParams() {
    const environmentDependentParams = this.acousticalParams.filter(
      p => p.environmentDependent
    );

    for (const file of this.getAllImpulseResponseFiles()) {
      this.analyzeFile(environmentDependentParams, file);
    }
  }
}

/**
 * @copyright Michal Zalecki
 * @returns A pseudo-random ID
 */
function randomId(): string {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(8);
}
