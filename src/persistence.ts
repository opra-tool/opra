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
