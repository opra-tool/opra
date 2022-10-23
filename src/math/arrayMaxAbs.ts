export function arrayMaxAbs(array: Float64Array): number {
  let max = 0;

  for (let i = 0; i < array.length; i += 1) {
    if (Math.abs(array[i]) > max) {
      max = Math.abs(array[i]);
    }
  }

  return max;
}
