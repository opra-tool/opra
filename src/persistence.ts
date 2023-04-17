import { openDB, IDBPDatabase } from 'idb';
import { EnvironmentValues } from './analyzing/environment-values';
import { ImpulseResponse } from './analyzing/impulse-response';

const RESPONSES_STORE = 'saved-response';
const ENVIRONMENT_VALUES_STORE = 'environment-values';

type ImpulseResponseRecord = Omit<
  ImpulseResponse,
  'buffer' | 'originalBuffer'
> & {
  samples: Float32Array[];
  originalSamples?: Float32Array[];
};

type DBSchema = {
  [RESPONSES_STORE]: ImpulseResponseRecord;
  [ENVIRONMENT_VALUES_STORE]: EnvironmentValues;
};

export class Persistence {
  private db: IDBPDatabase<DBSchema> | null = null;

  async init() {
    this.db = await openDB<DBSchema>('raqi-persistence', 2, {
      upgrade: _db => {
        if (!_db.objectStoreNames.contains(RESPONSES_STORE)) {
          _db.createObjectStore(RESPONSES_STORE, {
            keyPath: 'id',
          });
        }

        if (!_db.objectStoreNames.contains(ENVIRONMENT_VALUES_STORE)) {
          _db.createObjectStore(ENVIRONMENT_VALUES_STORE, {
            autoIncrement: true,
          });
        }
      },
      blocking: () => {
        this.db?.close();
      },
    });
  }

  async getEnvironmentValues(): Promise<EnvironmentValues | undefined> {
    if (!this.db) {
      throw new Error('expected DB to be available');
    }

    const values = await this.db.getAll(ENVIRONMENT_VALUES_STORE);

    return parseEnvironmentValues(values);
  }

  async saveEnvironmentValues(values: EnvironmentValues): Promise<void> {
    if (!this.db) {
      throw new Error('expected DB to be available');
    }

    await this.db.clear(ENVIRONMENT_VALUES_STORE);
    await this.db.add(ENVIRONMENT_VALUES_STORE, values);
  }

  async getResponses(): Promise<ImpulseResponse[]> {
    if (!this.db) {
      throw new Error('expected DB to be available');
    }

    const records = await this.db.getAll(RESPONSES_STORE);

    const responses = [];
    for (const record of records) {
      if (isValidResponseRecord(record)) {
        responses.push(recordToResponse(record));
      } else {
        this.deleteResponse(record.id);
      }
    }

    return responses;
  }

  async saveResponse(response: ImpulseResponse): Promise<void> {
    if (!this.db) {
      throw new Error('expected DB to be available');
    }

    await this.db.put(RESPONSES_STORE, responseToRecord(response));
  }

  async deleteResponse(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('expected DB to be available');
    }

    await this.db.delete(RESPONSES_STORE, id);
  }
}

function parseEnvironmentValues(
  maybeValues: unknown[]
): EnvironmentValues | undefined {
  if (maybeValues.length === 0) {
    return undefined;
  }

  return isEnvironmentValues(maybeValues[0]) ? maybeValues[0] : undefined;
}

function isEnvironmentValues(
  maybeValues: unknown
): maybeValues is EnvironmentValues {
  const values = maybeValues as EnvironmentValues;

  if (typeof values.airTemperature !== 'number') {
    return false;
  }

  if (typeof values.distanceFromSource !== 'number') {
    return false;
  }

  if (typeof values.relativeHumidity !== 'number') {
    return false;
  }

  if (
    values.airDensity !== undefined &&
    typeof values.airDensity !== 'number'
  ) {
    return false;
  }

  if (
    values.referencePressure !== undefined &&
    typeof values.referencePressure !== 'number'
  ) {
    return false;
  }

  if (
    values.sourcePower !== undefined &&
    typeof values.sourcePower !== 'number'
  ) {
    return false;
  }

  return true;
}

function responseToRecord({
  buffer,
  originalBuffer,
  ...rest
}: ImpulseResponse): ImpulseResponseRecord {
  const samples: Float32Array[] = [];

  for (let i = 0; i < buffer.numberOfChannels; i += 1) {
    samples[i] = new Float32Array(buffer.length);
    buffer.copyFromChannel(samples[i], i);
  }

  let originalSamples: Float32Array[] | undefined;
  if (originalBuffer) {
    originalSamples = [];
    for (let i = 0; i < originalBuffer.numberOfChannels; i += 1) {
      originalSamples[i] = new Float32Array(originalBuffer.length);
      originalBuffer.copyFromChannel(originalSamples[i], i);
    }
  }

  return {
    samples,
    originalSamples,
    ...rest,
  };
}

function recordToResponse({
  samples,
  originalSamples,
  sampleRate,
  ...rest
}: ImpulseResponseRecord): ImpulseResponse {
  const buffer = new AudioBuffer({
    sampleRate,
    numberOfChannels: samples.length,
    length: samples[0].length,
  });

  for (let i = 0; i < samples.length; i += 1) {
    buffer.copyToChannel(samples[i], i);
  }

  let originalBuffer;
  if (originalSamples) {
    originalBuffer = new AudioBuffer({
      sampleRate,
      numberOfChannels: originalSamples.length,
      length: originalSamples[0].length,
    });

    for (let i = 0; i < originalSamples.length; i += 1) {
      originalBuffer.copyToChannel(originalSamples[i], i);
    }
  }

  return {
    buffer,
    originalBuffer,
    sampleRate,
    ...rest,
  };
}

function isValidResponseRecord(record: unknown): boolean {
  if (!record) {
    return false;
  }

  if (typeof record !== 'object') {
    return false;
  }

  const response = record as ImpulseResponseRecord;

  return (
    typeof response.type === 'string' &&
    typeof response.id === 'string' &&
    typeof response.color === 'string' &&
    typeof response.duration === 'number' &&
    typeof response.fileName === 'string' &&
    typeof response.sampleRate === 'number' &&
    response.samples instanceof Array &&
    (typeof response.originalSamples === 'undefined' ||
      response.originalSamples instanceof Array)
  );
}
