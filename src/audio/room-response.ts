export type RoomResponse = {
  type: 'monaural' | 'binaural';
  id: string;
  color: string;
  fileName: string;
  buffer: AudioBuffer;
  durationSeconds: number;
  sampleRate: number;
  isProcessing: boolean;
  isEnabled: boolean;
};
