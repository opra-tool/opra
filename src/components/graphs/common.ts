export function getFrequencyValues(): number[] {
  return [62.5, 125, 250, 500, 1000, 2000, 4000, 8000];
}

export function getFrequencyLabels(): string[] {
  return getFrequencyValues().map(v => v.toString());
}
