import { ImpulseResponse } from '../analyzing/impulse-response';
import {
  PlaybackSource,
  PlaybackSourceFactory,
} from './convolver-playback-source';

type Config = {
  id: string;
  normalize: boolean;
  startTime: number;
  response: ImpulseResponse | null;
};

export const UPDATE_EVENT = 'update';

export class ConvolverPlayback extends EventTarget {
  ended = false;

  private state: 'paused' | 'playing' = 'paused';

  private ctx: AudioContext;

  readonly source: PlaybackSource;

  readonly id: string;

  private convolver: ConvolverNode | null = null;

  constructor(
    { response, normalize, startTime, id }: Config,
    makeSource: PlaybackSourceFactory
  ) {
    super();

    this.id = id;

    if (response) {
      this.ctx = new AudioContext({
        sampleRate: response.sampleRate,
      });
    } else {
      this.ctx = new AudioContext();
    }

    this.source = makeSource(this.ctx, startTime);
    this.source.addEventListener('durationknown', () =>
      this.dispatchEvent(new Event(UPDATE_EVENT))
    );
    this.source.addEventListener('play', () => {
      this.state = 'playing';
      this.dispatchEvent(new Event(UPDATE_EVENT));
    });
    this.source.addEventListener('pause', () => {
      this.state = 'paused';
      this.dispatchEvent(new Event(UPDATE_EVENT));
    });
    this.source.addEventListener('ended', () => {
      this.ended = true;
      this.dispatchEvent(new Event(UPDATE_EVENT));
    });

    if (response) {
      this.convolver = this.ctx.createConvolver();
      this.convolver.buffer = response.buffer;
      this.convolver.normalize = normalize;

      this.source.connect(this.convolver);
      this.convolver.connect(this.ctx.destination);
    } else {
      this.source.connect(this.ctx.destination);
    }
  }

  get isPlaying(): boolean {
    return this.state === 'playing';
  }

  get isPaused(): boolean {
    return this.state === 'paused';
  }

  get currentTime(): number {
    return this.source.currentTime;
  }

  play(): void {
    this.source.start();
  }

  pause(): void {
    this.source.stop();
  }

  togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  async destroy(): Promise<void> {
    await this.ctx.close();
  }
}
