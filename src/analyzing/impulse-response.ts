export type ImpulseResponseType = 'monaural' | 'binaural' | 'mid-side';

export type ImpulseResponse = {
  type: ImpulseResponseType;
  id: string;
  color: string;
  fileName: string;
  buffer: AudioBuffer;
  originalBuffer?: AudioBuffer;
  duration: number;
  sampleRate: number;
};
