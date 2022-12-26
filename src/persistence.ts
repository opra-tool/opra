import { openDB, IDBPDatabase } from 'idb';
import { RoomResponse } from './audio/room-response';
import { BinauralResults } from './binaural-processing';
import { MonauralResults } from './monaural-processing';

const RESPONSES_STORE = 'saved-response';

type RoomResponseRecord = Omit<RoomResponse, 'isProcessing' | 'buffer'> & {
  results: MonauralResults | BinauralResults;
  samples: Float32Array[];
};

type DBSchema = {
  [RESPONSES_STORE]: RoomResponseRecord;
};

async function getDB(): Promise<IDBPDatabase<DBSchema>> {
  const db = await openDB<DBSchema>('raqi-persistence', 1, {
    upgrade(_db) {
      _db.createObjectStore(RESPONSES_STORE, {
        keyPath: 'id',
      });
    },
  });

  return db;
}

export async function persistResponse(
  response: RoomResponse,
  results: MonauralResults | BinauralResults
): Promise<void> {
  const record = responseToRecord(response, results);

  const db = await getDB();
  await db.add(RESPONSES_STORE, record);
}

export async function removeResponse(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(RESPONSES_STORE, id);
}

export async function getResponses(): Promise<
  [RoomResponse, MonauralResults | BinauralResults][]
> {
  const db = await getDB();

  const records = await db.getAll(RESPONSES_STORE);

  const responses = [];
  for (const record of records) {
    if (isValidResponseRecord(record)) {
      responses.push(recordToResponse(record));
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        'persistence contained possibly malformed room response record',
        record
      );
    }
  }

  return responses;
}

function responseToRecord(
  { buffer, isProcessing, ...rest }: RoomResponse,
  results: MonauralResults | BinauralResults
): RoomResponseRecord {
  const samples: Float32Array[] = [];

  for (let i = 0; i < buffer.numberOfChannels; i += 1) {
    samples[i] = new Float32Array(buffer.length);
    buffer.copyFromChannel(samples[i], i);
  }

  return {
    samples,
    results,
    ...rest,
  };
}

function recordToResponse({
  samples,
  sampleRate,
  results,
  ...rest
}: RoomResponseRecord): [RoomResponse, MonauralResults | BinauralResults] {
  const numberOfChannels = samples.length;

  const buffer = new AudioBuffer({
    sampleRate,
    numberOfChannels,
    length: samples[0].length,
  });

  for (let i = 0; i < samples.length; i += 1) {
    buffer.copyToChannel(samples[i], i);
  }

  return [
    {
      buffer,
      sampleRate,
      isProcessing: false,
      ...rest,
    },
    results,
  ];
}

function isValidResponseRecord(record: unknown): boolean {
  if (!record) {
    return false;
  }

  if (typeof record !== 'object') {
    return false;
  }

  const response = record as RoomResponseRecord;

  return (
    typeof response.type === 'string' &&
    typeof response.id === 'string' &&
    typeof response.color === 'string' &&
    typeof response.durationSeconds === 'number' &&
    typeof response.fileName === 'string' &&
    typeof response.isEnabled === 'boolean' &&
    typeof response.sampleRate === 'number' &&
    response.samples instanceof Array &&
    typeof response.results === 'object'
  );
}

export function retrieveValueOrDefault(
  key: string,
  defaultValue: number
): number {
  const stored = localStorage.getItem(key);

  if (stored === null) {
    return defaultValue;
  }

  return parseFloat(stored);
}

export function retrieveValue(key: string): number | null {
  const stored = localStorage.getItem(key);

  if (stored === null) {
    return null;
  }

  return parseFloat(stored);
}

export function persistValue(key: string, value: number): void {
  localStorage.setItem(key, value.toString());
}
