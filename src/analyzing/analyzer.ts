import { Persistence } from '../persistence';
import { readAudioFile } from '../audio/audio-file-reading';
import { convertBetweenBinauralAndMidSide } from '../conversion';
import { EventEmitter } from '../event-emitter';
import { EnvironmentValues } from './environment-values';
import { ImpulseResponse } from './impulse-response';
import {
  processImpulseResponse,
  IntermediateResults,
  Results,
} from './processing';
import { calculateStrengths } from './sound-strength';
import { IRBuffer } from './buffer';

const DEFAULT_RELATIVE_HUMIDITY = 50;
const DEFAULT_AIR_TEMPERATURE = 20;
const DEFAULT_DISTANCE_FROM_SOURCE = 10;
const DEFAULT_AIR_DENSITY = 1.2;

type AnalyzerEventMap = {
  'file-adding-error': { fileName: string; error: Error };
  'file-processing-error': { id: string; fileName: string; error: Error };
  'environment-values-update': {};
  'response-added': { id: string };
  'response-removed': { id: string };
  change: undefined;
};

export class Analyzer extends EventEmitter<AnalyzerEventMap> {
  private persistence: Persistence = new Persistence();

  private environment: EnvironmentValues = {
    airTemperature: DEFAULT_AIR_TEMPERATURE,
    relativeHumidity: DEFAULT_RELATIVE_HUMIDITY,
    distanceFromSource: DEFAULT_DISTANCE_FROM_SOURCE,
    airDensity: DEFAULT_AIR_DENSITY,
  };

  private responses: ImpulseResponse[] = [];

  private intermediateResults: Map<string, IntermediateResults> = new Map();

  private results: Map<string, Results> = new Map();

  private squaredIRs: Map<string, Float32Array> = new Map();

  constructor() {
    super();

    this.persistence.init().then(() => {
      this.persistence.getResponses().then(responses => {
        for (const response of responses) {
          this.responses.push(response);
          this.analyzeResponse(response);

          this.dispatchEvent('response-added', { id: response.id });
        }
      });
      this.persistence.getEnvironmentValues().then(values => {
        if (values) {
          this.environment = values;
        }
      });
    });
  }

  getEnvironmentValues(): EnvironmentValues {
    return this.environment;
  }

  setEnvironmentValues(values: EnvironmentValues) {
    this.environment = values;

    setTimeout(() => {
      this.dispatchEvent('environment-values-update', {});

      this.recalculateStrengths();

      this.persistence.saveEnvironmentValues(values);
    }, 0);
  }

  getResponses(): ImpulseResponse[] {
    return this.responses;
  }

  async addResponseFiles(files: FileList): Promise<void> {
    for (let i = 0; i < files.length; i++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const id = await this.addResponseFile(files[i]);

        this.dispatchEvent('response-added', { id });
      } catch (err) {
        this.dispatchEvent('file-adding-error', {
          fileName: files[i].name,
          error: err instanceof Error ? err : new Error(),
        });
      }
    }
  }

  private async addResponseFile(file: File): Promise<string> {
    const buffer = await readAudioFile(file);

    if (buffer.numberOfChannels < 1 || buffer.numberOfChannels > 2) {
      throw new Error(`unsupported channel count: ${buffer.numberOfChannels}`);
    }

    const id = Analyzer.randomId();

    const response: ImpulseResponse = {
      type: buffer.numberOfChannels === 1 ? 'monaural' : 'binaural',
      id,
      fileName: file.name,
      buffer,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
    };

    this.responses.push(response);

    setTimeout(() => {
      this.persistence.saveResponse(response);

      this.analyzeResponse(response);
    }, 0);

    return id;
  }

  removeAllResponses() {
    for (const response of this.responses) {
      this.removeResponse(response.id);
    }
  }

  removeResponse(id: string) {
    this.responses = this.responses.filter(el => el.id !== id);

    this.results.delete(id);
    this.intermediateResults.delete(id);
    this.squaredIRs.delete(id);

    this.dispatchEvent('change', undefined);

    this.persistence.deleteResponse(id);
  }

  markResponseAs(id: string, markAs: 'binaural' | 'mid-side') {
    const response = this.getResponseOrThrow(id);

    if (response.type === markAs) {
      return;
    }

    response.type = markAs;

    this.results.delete(id);
    this.analyzeResponse(response);

    this.dispatchEvent('change', undefined);

    this.persistence.saveResponse(response);
  }

  convertResponse(id: string) {
    const response = this.getResponseOrThrow(id);

    const newResponse = convertBetweenBinauralAndMidSide(response);
    this.analyzeResponse(newResponse);

    this.results.delete(id);
    this.responses = this.responses.map(r => {
      if (r.id === id) {
        return newResponse;
      }

      return r;
    });

    this.dispatchEvent('change', undefined);

    this.persistence.saveResponse(newResponse);
  }

  getSquaredIR(responseId: string): Float32Array {
    const maybeSquaredIR = this.squaredIRs.get(responseId);

    if (!maybeSquaredIR) {
      throw new Error(
        `expected to find squared impulse response for id '${responseId}'`
      );
    }

    return maybeSquaredIR;
  }

  hasResults(responseId: string): boolean {
    return this.results.has(responseId);
  }

  getResultsOrThrow(responseId: string): Results {
    const maybeResults = this.results.get(responseId);

    if (!maybeResults) {
      throw new Error(`expected to find results for id ${responseId}`);
    }

    return maybeResults;
  }

  private getIntermediateResultsOrThrow(
    responseId: string
  ): IntermediateResults {
    const maybeResults = this.intermediateResults.get(responseId);

    if (!maybeResults) {
      throw new Error(
        `expected to find intermediate results for id ${responseId}`
      );
    }

    return maybeResults;
  }

  private getResponseOrThrow(id: string): ImpulseResponse {
    const response = this.responses.find(r => r.id === id);

    if (!response) {
      throw new Error(`cannot find response with id '${id}'`);
    }

    return response;
  }

  private async analyzeResponse(ir: ImpulseResponse) {
    try {
      const buffer = IRBuffer.fromAudioBuffer(ir.buffer);
      const [results, intermediateResults, squaredIR] =
        await processImpulseResponse(ir.type, buffer);

      this.squaredIRs.set(ir.id, squaredIR);
      this.intermediateResults.set(ir.id, intermediateResults);
      this.results.set(ir.id, {
        ...results,
        ...(await calculateStrengths(
          buffer,
          {
            ...intermediateResults,
            c80Bands: results.c80Bands,
          },
          this.environment
        )),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      if (err instanceof Error) {
        this.dispatchEvent('file-processing-error', {
          id: ir.id,
          fileName: ir.fileName,
          error: err,
        });
      }
    }

    this.dispatchEvent('change', undefined);
  }

  private async recalculateStrengths() {
    for (const response of this.responses) {
      const results = this.getResultsOrThrow(response.id);
      const intermediateResults = this.getIntermediateResultsOrThrow(
        response.id
      );

      this.results.set(response.id, {
        ...results,
        // eslint-disable-next-line no-await-in-loop
        ...(await calculateStrengths(
          IRBuffer.fromAudioBuffer(response.buffer),
          {
            ...intermediateResults,
            c80Bands: results.c80Bands,
          },
          this.environment
        )),
      });
    }

    this.dispatchEvent('change', undefined);
  }

  /**
   * @copyright Michal Zalecki
   * @returns A pseudo-random ID
   */
  private static randomId(): string {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(8);
  }
}
