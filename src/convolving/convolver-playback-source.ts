export interface ConvolverPlaybackSource extends EventTarget {
  get sourceNode(): AudioNode | undefined;

  get duration(): number;

  init(ctx: AudioContext): void;

  start(): void;

  stop(): void;

  disconnect(): void;
}

export class ConvolverStreamPlaybackSource extends EventTarget implements ConvolverPlaybackSource {
  private node?: MediaElementAudioSourceNode;

  private audioEl: HTMLAudioElement;

  constructor(fileName: string) {
    super();

    this.audioEl = new Audio(`/assets/sounds/${fileName}`);
    this.audioEl.addEventListener('canplay', () => {
      this.dispatchEvent(new Event("play"));
    });
    this.audioEl.addEventListener('timeupdate', () => {
      this.dispatchEvent(new Event("durationknown"))
    });
    this.audioEl.addEventListener('play', () => {
      this.dispatchEvent(new Event("play"));
    });
    this.audioEl.addEventListener('pause', () => {
      this.dispatchEvent(new Event("pause"));
    });
    this.audioEl.addEventListener('ended', () => {
      this.dispatchEvent(new Event("ended"));
    });
  }

  get sourceNode(): AudioNode | undefined {
    return this.node;
  }

  disconnect(): void {
    this.node?.disconnect();
  }
  
  init(ctx: AudioContext): void {
    this.node = ctx.createMediaElementSource(this.audioEl);
  }

  get duration(): number {
    return this.audioEl.duration;
  }

  start(): void {
    this.audioEl.play();
  }

  stop(): void {
    this.audioEl.pause();
  }
}


export class ConvolverBufferPlaybackSource extends EventTarget implements ConvolverPlaybackSource {
  private node?: AudioBufferSourceNode;

  private buffer: AudioBuffer;
  
  constructor(buffer: AudioBuffer) {
    super();

    
    this.buffer = buffer;

    this.dispatchEvent(new Event("durationknown"));
  }

  get sourceNode(): AudioNode | undefined {
    return this.node;
  }

  init(ctx: AudioContext): void {
    this.node = ctx.createBufferSource();
    this.node.buffer = this.buffer;
    this.node.addEventListener('ended', () => {
      this.dispatchEvent(new Event("ended"));
    });
  }

  disconnect(): void {
    this.node?.disconnect();
  }

  get duration(): number {
    return this.buffer.duration;
  }
  
  start(): void {
    this.node?.start();
  }

  stop(): void {
    this.node?.stop();
  }
}
