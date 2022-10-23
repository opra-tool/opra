export function arrayMax(array: Float64Array): number {
  let max = 0;
  for (let i = 0; i < array.length; i += 1) {
    if (array[i] > max) {
      max = array[i];
    }
  }

  return max;
}
