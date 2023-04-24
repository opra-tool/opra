import { arraySum } from '../math/arrays';

export class IRBuffer {
  readonly sampleRate;

  private channels;

  constructor(channels: Float32Array | Float32Array[], sampleRate: number) {
    // TODO: length validation
    this.channels = channels instanceof Array ? channels : [channels];
    this.sampleRate = sampleRate;
  }

  get numberOfChannels() {
    return this.channels.length;
  }

  get length() {
    return this.channels[0].length;
  }

  static fromAudioBuffer(audioBuffer: AudioBuffer): IRBuffer {
    const channels = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }
    return new IRBuffer(channels, audioBuffer.sampleRate);
  }

  getChannel(channelIndex: number) {
    return this.channels[channelIndex];
  }

  transform(callback: (channel: Float32Array) => Float32Array): IRBuffer {
    return new IRBuffer(this.channels.map(callback), this.sampleRate);
  }

  // TODO: better name?
  transformAll(
    callback: (channels: Float32Array[]) => Float32Array[]
  ): IRBuffer {
    return new IRBuffer(callback(this.channels), this.sampleRate);
  }

  sum(): number {
    this.assertMono();

    return arraySum(this.channels[0]);
  }

  assertMono() {
    if (this.channels.length !== 1) {
      throw new Error('expected mono buffer');
    }
  }

  assertStereo() {
    if (this.channels.length !== 2) {
      throw new Error('expected stereo buffer');
    }
  }

  [Symbol.iterator](): Iterator<Float32Array> {
    let index = 0;
    return {
      next: () =>
        // eslint-disable-next-line no-plusplus
        ({
          value: this.channels[index++],
          done: index >= this.channels.length,
        }),
    };
  }
}
