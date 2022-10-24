export function arraySum(array: Float64Array): number {
  let sum = 0;

  for (const el of array) {
    sum += el;
  }

  return sum;
}
