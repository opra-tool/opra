/* eslint-disable class-methods-use-this */

/**
 * Represents an audio node which converts a mid/side signal to a binaural signal.
 *
 * TODO: should this use / sqrt(2)
 */
class MidSideToBinauralAudioWorkletProcessor extends AudioWorkletProcessor {
  process(inputs: Float32Array[][], outputs: Float32Array[][]) {
    const input = inputs[0];
    const output = outputs[0];

    if (input[0]) {
      for (let i = 0; i < input[0].length; i += 1) {
        // L = M + S
        output[0][i] = input[0][i] + input[1][i];

        // R = M - S
        output[1][i] = input[0][i] - input[1][i];
      }
    }

    return true;
  }
}

registerProcessor(
  'mid-side-to-binaural-audio-worklet-processor',
  MidSideToBinauralAudioWorkletProcessor
);
