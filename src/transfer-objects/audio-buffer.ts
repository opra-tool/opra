import { arraySum } from '../math/arrays';

export class CustomAudioBuffer {
  readonly sampleRate: number;

  private channels: Float32Array[];

  constructor(channels: Float32Array | Float32Array[], sampleRate: number) {
    if (channels instanceof Array) {
      if (channels.length > 2) {
        throw new Error('more than two channels are not supported');
      }

      if (channels[1] && channels[0].length !== channels[1].length) {
        throw new Error('expected channels to have the same lengths');
      }
    }

    this.channels = channels instanceof Array ? channels : [channels];
    this.sampleRate = sampleRate;
  }

  get numberOfChannels() {
    return this.channels.length;
  }

  get length() {
    return this.channels[0].length;
  }

  static fromNativeAudioBuffer(audioBuffer: AudioBuffer): CustomAudioBuffer {
    const channels = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }
    return new CustomAudioBuffer(channels, audioBuffer.sampleRate);
  }

  getChannel(channelIndex: number) {
    return this.channels[channelIndex];
  }

  transform(
    callback: (channel: Float32Array) => Float32Array
  ): CustomAudioBuffer {
    return new CustomAudioBuffer(this.channels.map(callback), this.sampleRate);
  }

  sum(): number {
    if (this.channels.length !== 1) {
      throw new Error('expected buffer to be mono');
    }

    return arraySum(this.channels[0]);
  }

  [Symbol.iterator](): Iterator<Float32Array> {
    let index = 0;
    return {
      next: () => ({
        // eslint-disable-next-line no-plusplus
        value: this.channels[index++],
        done: index > this.channels.length,
      }),
    };
  }
}
