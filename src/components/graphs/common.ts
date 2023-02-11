export function getFrequencyLabels(): string[] {
  return [62.5, 125, 250, 500, 1000, 2000, 4000, 8000].map(v => v.toString());
}
