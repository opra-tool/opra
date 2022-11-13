export function normalizeArray(
  array: Float64Array,
  maxValue: number
): Float64Array {
  const res = new Float64Array(array.length);

  for (let i = 0; i < array.length; i += 1) {
    res[i] = array[i] / maxValue;
  }

  return res;
}
