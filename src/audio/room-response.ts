export type RoomResponse = {
  type: 'monaural' | 'binaural';
  id: string;
  color: string;
  fileName: string;
  durationSeconds: number;
  sampleRate: number;
  isProcessing: boolean;
  isEnabled: boolean;
};
