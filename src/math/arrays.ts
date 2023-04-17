export function arraySum(array: Float32Array | Float64Array): number {
  let sum = 0;

  for (const el of array) {
    sum += el;
  }

  return sum;
}

export function arraySquaredSum(array: Float32Array | Float64Array): number {
  let sum = 0;

  for (const el of array) {
    sum += el ** 2;
  }

  return sum;
}

export function arrayMax(array: Float32Array | Float64Array): number {
  let max = -Infinity;

  for (let i = 0; i < array.length; i += 1) {
    if (array[i] > max) {
      max = array[i];
    }
  }

  return max;
}

export function arrayMaxAbs(array: Float32Array | Float64Array): number {
  let max = -Infinity;

  for (let i = 0; i < array.length; i += 1) {
    if (Math.abs(array[i]) > max) {
      max = Math.abs(array[i]);
    }
  }

  return max;
}
