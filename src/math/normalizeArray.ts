export function normalizeArray(array: Float64Array, maxValue: number) {
  return array.map(el => el / maxValue);
}
