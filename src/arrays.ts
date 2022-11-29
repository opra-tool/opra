export function isFreeOfNullValues<T>(array: (T | null)[]): array is T[] {
  return array.every(el => el !== null);
}

export function mapArrayParam<T extends object, K extends keyof T>(
  array: T[],
  key: K
): T[K][] {
  return array.map(el => el[key]);
}
