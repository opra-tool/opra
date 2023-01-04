// import { RoomResponse } from '../audio/room-response';
// import { ConvolverPlayback } from './convolver-playback-source';

// export class ConvolverLocalPlayback implements ConvolverPlayback {
//   fileName: string;

//   duration: number;

//   ended: boolean = false;

//   private state: 'paused' | 'playing' = 'paused';

//   private ctx: AudioContext;

//   private source: AudioBufferSourceNode;

//   private convolver: ConvolverNode | null = null;

//   private onUpdateListener: () => any = () => {};

//   constructor(fileName: string, buffer: AudioBuffer, response: RoomResponse | null, normalize: boolean, startTime: number | null) {
//     this.fileName = fileName;
//     this.duration = buffer.duration;

//     if (response) {
//       this.ctx = new AudioContext({
//         sampleRate: response.sampleRate,
//       });
//     } else {
//       this.ctx = new AudioContext();
//     }

//     this.source = this.ctx.createBufferSource();
//     this.source.buffer = buffer;

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

//   get isPlaying(): boolean {
//     return this.state === 'playing';
//   }

//   get isPaused(): boolean {
//     return this.state === 'paused';
//   }

//   get currentTime(): number {
//     return this.ctx.currentTime;
//   }

//   play(): void {
//     this.source.start();
//     this.state = 'playing';
//   }

//   pause(): void {
//     this.source.stop();
//     this.state = 'paused';
//   }

//   togglePlayPause(): void {
//     if (this.isPlaying) {
//       this.pause();
//     } else {
//       this.play();
//     }
//   }

//   async destroy(): Promise<void> {
//     this.source.stop();
//     this.source.disconnect();
//     this.convolver?.disconnect();
//     await this.ctx.close(); 
//   }

//   setOnUpdateListener(listener: () => any): void {
//     this.onUpdateListener = listener;
//   }

//   private notifyOnUpdateListener() {
//     this.onUpdateListener();
//   }

//   private setupEventListeners() {
//     this.source.addEventListener("ended", () => {
//       this.ended = true;
//       this.notifyOnUpdateListener();
//     })
//   }
// }
