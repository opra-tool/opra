/**
 * Calculate the frequency response of a digital filter for given evaluation frequency.
 * The digital filter is defined by feedforward and feedback coefficients.
 */
export function frequencyResponse(
  feedforward: number[],
  feedback: number[],
  evaluationFrequency: number,
  sampleRate: number
): number {
  if (feedback.length !== feedforward.length) {
    throw new Error(
      'expected lengths of feedback and feedforward arrays to match'
    );
  }

  const ctx = new OfflineAudioContext({
    length: 1, // irrelevant, but cannot be 0
    sampleRate,
  });
  const filter = ctx.createIIRFilter(feedforward, feedback);
  const magnitude = new Float32Array(1);

  filter.getFrequencyResponse(
    new Float32Array([evaluationFrequency]),
    magnitude,
    new Float32Array(1)
  );

  return magnitude[0];
}

export function filterChainFrequencyResponse(
  filters: IIRFilterNode[],
  evaluationFrequencies: Float32Array
): Float32Array {
  const result = new Float32Array(evaluationFrequencies.length);
  for (let i = 0; i < result.length; i++) {
    result[i] = 1;
  }

  for (const filter of filters) {
    const magnitude = new Float32Array(evaluationFrequencies.length);

    filter.getFrequencyResponse(
      evaluationFrequencies,
      magnitude,
      new Float32Array(evaluationFrequencies.length)
    );

    for (let i = 0; i < magnitude.length; i++) {
      result[i] *= magnitude[i];
    }
  }

  return result;
}
