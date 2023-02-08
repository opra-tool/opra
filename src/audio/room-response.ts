export type RoomResponse = {
  type: 'monaural' | 'binaural' | 'mid-side';
  id: string;
  color: string;
  fileName: string;
  buffer: AudioBuffer;
  duration: number;
  sampleRate: number;
  isEnabled: boolean;
};
