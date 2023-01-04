// import { RoomResponse } from '../audio/room-response';
// import { ConvolverPlayback } from './convolver-playback';

// export class ConvolverStreamPlayback implements ConvolverPlayback {
//   fileName: string;

//   duration = 0;

//   ended = false;

//   private state: 'paused' | 'playing' = 'paused';

//   private audioEl: HTMLAudioElement;

//   private ctx: AudioContext;

//   private source: MediaElementAudioSourceNode;

//   private convolver: ConvolverNode | null = null;

//   private onUpdateListener: () => any = () => {};

//   private startTime: number | null;

//   constructor(
//     fileName: string,
//     response: RoomResponse | null,
//     normalize: boolean,
//     startTime: number | null
//   ) {
//     this.fileName = fileName;
//     this.audioEl = new Audio(`/assets/sounds/${fileName}`);
//     this.startTime = startTime;

//     if (response) {
//       this.ctx = new AudioContext({
//         sampleRate: response.sampleRate,
//       });
//     } else {
//       this.ctx = new AudioContext();
//     }

//     this.source = this.ctx.createMediaElementSource(this.audioEl);

//     if (response) {
//       this.convolver = this.ctx.createConvolver();
//       this.convolver.buffer = response.buffer;
//       this.convolver.normalize = normalize;

//       this.source.connect(this.convolver);
//       this.convolver.connect(this.ctx.destination);
//     } else {
//       this.source.connect(this.ctx.destination);
//     }

//     this.setupEventListeners();
//   }

//   setOnUpdateListener(listener: () => any): void {
//     this.onUpdateListener = listener;
//   }

//   private notifyOnUpdateListener() {
//     this.onUpdateListener();
//   }

//   get isPlaying(): boolean {
//     return this.state === 'playing';
//   }

//   get isPaused(): boolean {
//     return this.state === 'paused';
//   }

//   get currentTime(): number {
//     return this.audioEl.currentTime;
//   }

//   play(): void {
//     this.audioEl.play();
//   }

//   pause(): void {
//     this.audioEl.pause();
//   }

//   togglePlayPause(): void {
//     if (this.isPlaying) {
//       this.pause();
//     } else {
//       this.play();
//     }
//   }

//   async destroy(): Promise<void> {
//     this.audioEl.pause();
//     this.convolver?.disconnect();
//     this.source.disconnect();
//     await this.ctx.close();
//   }

//   private setupEventListeners() {
//     this.audioEl.addEventListener('canplay', () => {
//       if (this.startTime !== null) {
//         this.audioEl.currentTime = this.startTime;
//         this.startTime = null;
//       }
//     });
//     this.audioEl.addEventListener('timeupdate', ev => {
//       const { duration } = ev.target as HTMLAudioElement;
//       this.duration = duration;
//       this.notifyOnUpdateListener();
//     });
//     this.audioEl.addEventListener('play', () => {
//       this.state = 'playing';
//       this.notifyOnUpdateListener();
//     });
//     this.audioEl.addEventListener('pause', () => {
//       this.state = 'paused';
//       this.notifyOnUpdateListener();
//     });
//     this.audioEl.addEventListener('ended', () => {
//       this.ended = true;
//       this.notifyOnUpdateListener();
//     });
//   }
// }
