import { openDB, IDBPDatabase } from 'idb';
import { EnvironmentValues } from './transfer-objects/environment-values';
import { ImpulseResponseFile } from './transfer-objects/impulse-response-file';

const RESPONSES_STORE = 'saved-response';
const ENVIRONMENT_VALUES_STORE = 'environment-values';

type ImpulseResponseRecord = Omit<ImpulseResponseFile, 'buffer'> & {
  samples: Float32Array[];
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

  async getFiles(): Promise<ImpulseResponseFile[]> {
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

  async saveResponse(response: ImpulseResponseFile): Promise<void> {
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
  ...rest
}: ImpulseResponseFile): ImpulseResponseRecord {
  const samples: Float32Array[] = [];

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    samples[i] = new Float32Array(buffer.length);
    buffer.copyFromChannel(samples[i], i);
  }

  return {
    samples,
    ...rest,
  };
}

function recordToResponse({
  samples,
  sampleRate,
  ...rest
}: ImpulseResponseRecord): ImpulseResponseFile {
  const buffer = new AudioBuffer({
    sampleRate,
    numberOfChannels: samples.length,
    length: samples[0].length,
  });

  for (let i = 0; i < samples.length; i++) {
    buffer.copyToChannel(samples[i], i);
  }

  return {
    buffer,
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
    typeof response.duration === 'number' &&
    typeof response.fileName === 'string' &&
    typeof response.sampleRate === 'number' &&
    response.samples instanceof Array
  );
}
