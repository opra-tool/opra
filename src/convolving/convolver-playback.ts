import { RoomResponse } from '../audio/room-response';
import { ConvolverPlaybackSource } from './convolver-playback-source';

type Config = {
  normalize: boolean,
  response: RoomResponse | null,
  startTime: number | null,
}

export class ConvolverPlayback {
  ended = false;

  private state: 'paused' | 'playing' = 'paused';

  private ctx: AudioContext;

  readonly source: ConvolverPlaybackSource;

  private convolver: ConvolverNode | null = null;

  private onUpdateListener: () => any = () => {};

  private startTime: number | null;

  constructor(
    { response, normalize, startTime }: Config,
    source: ConvolverPlaybackSource
  ) {
    this.startTime = startTime;
    
    if (response) {
      this.ctx = new AudioContext({
        sampleRate: response.sampleRate,
      });
    } else {
      this.ctx = new AudioContext();
    }
    
    this.source = source;
    this.source.addEventListener("durationknown", () => this.notifyOnUpdateListener());
    this.source.addEventListener("play", () => {
      this.state = "playing";
      this.notifyOnUpdateListener();
    });
    this.source.addEventListener("pause", () => {
      this.state = "paused";
      this.notifyOnUpdateListener();
    });
    this.source.addEventListener("ended", () => {
      this.ended = true;
      this.notifyOnUpdateListener();
    });

    this.source.init(this.ctx);

    // if (response) {
    //   this.convolver = this.ctx.createConvolver();
    //   this.convolver.buffer = response.buffer;
    //   this.convolver.normalize = normalize;

    //   this.source.connect(this.convolver);
    //   this.convolver.connect(this.ctx.destination);
    // } else {
    //   this.source.connect(this.ctx.destination);
    // }

    // this.setupEventListeners();
  }

  setOnUpdateListener(listener: () => any): void {
    this.onUpdateListener = listener;
  }

  private notifyOnUpdateListener() {
    this.onUpdateListener();
  }

  get isPlaying(): boolean {
    return this.state === 'playing';
  }

  get isPaused(): boolean {
    return this.state === 'paused';
  }

  get fileName(): string {
    return "TODO"
  }

  get currentTime(): number {
    return 0;
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

  // readyToPlay() {
  //   if (this.startTime !== null) {
  //     this.audioEl.currentTime = this.startTime;
  //     this.startTime = null;
  //   }
  // }

  async destroy(): Promise<void> {
    this.source.stop();
    this.source.disconnect();
    this.convolver?.disconnect();
    await this.ctx.close();
  }
}
