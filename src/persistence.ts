import { openDB, IDBPDatabase } from 'idb';
import { RoomResponse } from './audio/room-response';

const STORE_NAME = 'saved-response';

export async function getDB(): Promise<IDBPDatabase> {
  const db = await openDB('raqi-persistence', 1, {
    upgrade(_db) {
      _db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
      });
    },
  });

  return db;
}

export async function persistResponse(response: RoomResponse): Promise<void> {
  const db = await getDB();
  await db.add(STORE_NAME, response);
}

export async function removeResponse(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
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
