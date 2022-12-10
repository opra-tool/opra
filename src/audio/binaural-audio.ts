// TODO: rename to BinauralSamples
export class BinauralAudio {
  readonly leftSamples: Float32Array;

  readonly rightSamples: Float32Array;

  constructor(leftSamples: Float32Array, rightSamples: Float32Array) {
    if (leftSamples.length !== rightSamples.length) {
      throw new Error('expected left and right samples to be of equal length');
    }

    this.leftSamples = leftSamples;
    this.rightSamples = rightSamples;
  }
}

export function binauralAudioFromBuffer(buffer: AudioBuffer) {
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);

  return new BinauralAudio(leftChannel, rightChannel);
}
