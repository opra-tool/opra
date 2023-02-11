type EarlyLateFractions = {
  e50: Float32Array;
  l50: Float32Array;
  e80: Float32Array;
  l80: Float32Array;
};

/**
 * Calculates E50 as defined in ISO 3382-1.
 *
 * @param samples Samples of the audio.
 * @param sampleRate Sample rate of the audio.
 * @returns Samples before the 50ms mark.
 */
export function e50(samples: Float32Array, sampleRate: number): Float32Array {
  const index = Math.round(0.05 * sampleRate);

  return samples.subarray(0, index);
}

/**
 * Calculates L50 as defined in ISO 3382-1.
 *
 * @param samples Samples of the audio.
 * @param sampleRate Sample rate of the audio.
 * @returns Samples after the 50ms mark.
 */
export function l50(samples: Float32Array, sampleRate: number): Float32Array {
  const index = Math.round(0.05 * sampleRate);

  return samples.subarray(index);
}

/**
 * Calculates E80 as defined in ISO 3382-1.
 *
 * @param samples Samples of the audio.
 * @param sampleRate Sample rate of the audio.
 * @returns Samples before the 80ms mark.
 */
export function e80(samples: Float32Array, sampleRate: number): Float32Array {
  const index = Math.round(0.08 * sampleRate);

  return samples.subarray(0, index);
}

/**
 * Calculates L80 as defined in ISO 3382-1.
 *
 * @param samples Samples of the audio.
 * @param sampleRate Sample rate of the audio.
 * @returns Samples after the 80ms mark.
 */
export function l80(samples: Float32Array, sampleRate: number): Float32Array {
  const index = Math.round(0.08 * sampleRate);

  return samples.subarray(index);
}

/**
 * Calculate E50, L50, E80 and L80 as defined in ISO 3382-1.
 *
 * @param samples Audio samples
 * @param sampleRate Sample rate of audio
 * @returns An object containing E50, L50, E80 and L80.
 */
export function earlyLateFractions(
  samples: Float32Array,
  sampleRate: number
): EarlyLateFractions {
  return {
    e50: e50(samples, sampleRate),
    l50: l50(samples, sampleRate),
    e80: e80(samples, sampleRate),
    l80: l80(samples, sampleRate),
  };
}
