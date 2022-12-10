import { openDB, IDBPDatabase } from 'idb';
import { RoomResponse } from './audio/room-response';
import { BinauralResults } from './binaural-processing';
import { MonauralResults } from './monaural-processing';

const RESPONSES_STORE = 'saved-response';

type RoomResponseRecord = Omit<RoomResponse, 'isProcessing'> & {
  results: MonauralResults | BinauralResults;
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
  response: RoomResponseRecord
): Promise<void> {
  const db = await getDB();
  await db.add(RESPONSES_STORE, response);
}

export async function removeResponse(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(RESPONSES_STORE, id);
}

export async function getResponses(): Promise<RoomResponseRecord[]> {
  const db = await getDB();

  const records = await db.getAll(RESPONSES_STORE);

  const responses = [];
  for (const record of records) {
    if (isValidResponseRecord(record)) {
      responses.push(record);
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
