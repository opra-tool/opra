/**
 * Represents an audio node which converts a mid/side signal to a stereo signal.
 */
class MidSideToStereoConverter extends AudioWorkletProcessor {
  /* eslint-disable class-methods-use-this */
  process(inputs: Float32Array[][], outputs: Float32Array[][]) {
    const input = inputs[0];
    const output = outputs[0];

    if (input[0]) {
      for (let i = 0; i < input[0].length; i += 1) {
        // L = (M + S) / sqrt(2)
        output[0][i] = (input[0][i] + input[1][i]) / Math.SQRT2;

        // R = (M - S) / sqrt(2)
        output[1][i] = (input[0][i] - input[1][i]) / Math.SQRT2;
      }
    }

    return true;
  }
}

registerProcessor('mid-side-to-stereo-converter', MidSideToStereoConverter);
