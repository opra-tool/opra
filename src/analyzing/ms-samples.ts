export class MidSideSamples {
  readonly midChannel: Float32Array;

  readonly sideChannel: Float32Array;

  constructor(midChannel: Float32Array, sideChannel: Float32Array) {
    if (midChannel.length !== sideChannel.length) {
      throw new Error('expected left and right samples to be of equal length');
    }

    this.midChannel = midChannel;
    this.sideChannel = sideChannel;
  }

  get length(): number {
    return this.midChannel.length;
  }
}

export function midSideSamplesFromBuffer(buffer: AudioBuffer) {
  const midChannel = buffer.getChannelData(0);
  const sideChannel = buffer.getChannelData(1);

  return new MidSideSamples(midChannel, sideChannel);
}
