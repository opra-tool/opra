export type PlaybackSourceFactory = (
  ctx: AudioContext,
  startTime: number
  // eslint-disable-next-line no-use-before-define
) => PlaybackSource;

export interface PlaybackSource extends EventTarget {
  get duration(): number;

  get currentTime(): number;

  start(): void;

  stop(): void;

  disconnect(): void;

  connect(node: AudioNode): void;

  factory(): PlaybackSourceFactory;
}

class StreamPlaybackSource extends EventTarget implements PlaybackSource {
  private node: MediaElementAudioSourceNode;

  private audioEl: HTMLAudioElement;

  private startTime: number | null = null;

  private fileName: string;

  constructor(ctx: AudioContext, fileName: string, startTime: number) {
    super();

    this.startTime = startTime;
    this.fileName = fileName;

    this.audioEl = new Audio(`/assets/sounds/${fileName}`);
    this.node = ctx.createMediaElementSource(this.audioEl);

    this.audioEl.addEventListener('canplay', () => {
      if (this.startTime) {
        this.audioEl.currentTime = this.startTime;
        this.startTime = null;
      }

      this.dispatchEvent(new Event('play'));
    });
    this.audioEl.addEventListener('timeupdate', () => {
      this.dispatchEvent(new Event('durationknown'));
    });
    this.audioEl.addEventListener('play', () => {
      this.dispatchEvent(new Event('play'));
    });
    this.audioEl.addEventListener('pause', () => {
      this.dispatchEvent(new Event('pause'));
    });
    this.audioEl.addEventListener('ended', () => {
      this.dispatchEvent(new Event('ended'));
    });
  }

  get duration(): number {
    return this.audioEl.duration;
  }

  get currentTime(): number {
    return this.audioEl.currentTime;
  }

  connect(node: AudioNode): void {
    if (!this.node) {
      throw new Error();
    }

    this.node?.connect(node);
  }

  disconnect(): void {
    this.node?.disconnect();
  }

  start(): void {
    this.audioEl.play();
  }

  stop(): void {
    this.audioEl.pause();
  }

  factory(): PlaybackSourceFactory {
    return streamPlaybackSourceFactory(this.fileName);
  }
}

class BufferPlaybackSource extends EventTarget implements PlaybackSource {
  private node?: AudioBufferSourceNode;

  private buffer: AudioBuffer;

  private ctx?: AudioContext;

  private startTime: number | null = null;

  private currentTimeVal = 0;

  private interval;

  constructor(ctx: AudioContext, buffer: AudioBuffer, startTime: number) {
    super();

    this.buffer = buffer;
    this.startTime = startTime;
    this.ctx = ctx;
    this.node = ctx.createBufferSource();
    this.node.buffer = this.buffer;
    this.node.addEventListener('ended', () => {
      this.dispatchEvent(new Event('ended'));
    });

    this.dispatchEvent(new Event('durationknown'));

    this.interval = setInterval(() => {
      this.dispatchEvent(new Event('durationknown'));
    }, 500);
  }

  get currentTime(): number {
    return this.currentTimeVal + (this.ctx?.currentTime || 0);
  }

  get duration(): number {
    return this.buffer.duration;
  }

  connect(node: AudioNode): void {
    if (!this.node) {
      throw new Error('expected target node to be defined');
    }

    this.node.connect(node);
  }

  disconnect(): void {
    clearInterval(this.interval);
    this.node?.disconnect();
  }

  start(): void {
    if (!this.node) {
      throw new Error();
    }

    if (this.node.playbackRate.value === 0) {
      // AudioBufferSourceNode can only be started once - resetting playback rate to stop simulate pausing
      this.node.playbackRate.value = this.node.playbackRate.defaultValue;
    } else if (this.startTime) {
      this.currentTimeVal = this.startTime;
      this.node.start(0, this.startTime);
      this.node.playbackRate.value = 1;
    } else {
      this.currentTimeVal = 0;
      this.node.start();
    }
    this.dispatchEvent(new Event('play'));
  }

  stop(): void {
    if (!this.node) {
      throw new Error();
    }

    // AudioBufferSourceNode can only be started once - setting playback rate to 0 to simulate pausing
    this.node.playbackRate.value = 0;
    this.dispatchEvent(new Event('pause'));
  }

  factory(): PlaybackSourceFactory {
    return bufferPlaybackSourceFactory(this.buffer);
  }
}

export function streamPlaybackSourceFactory(
  fileName: string
): (ctx: AudioContext, startTime: number) => StreamPlaybackSource {
  return (ctx, startTime) => new StreamPlaybackSource(ctx, fileName, startTime);
}

export function bufferPlaybackSourceFactory(
  buffer: AudioBuffer
): (ctx: AudioContext, startTime: number) => BufferPlaybackSource {
  return (ctx, startTime) => new BufferPlaybackSource(ctx, buffer, startTime);
}
