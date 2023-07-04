export type ImpulseResponseType = 'omnidirectional' | 'binaural' | 'mid-side';

export type ImpulseResponseFile = {
  type: ImpulseResponseType;
  id: string;
  fileName: string;
  buffer: AudioBuffer;
  duration: number;
  sampleRate: number;
};
