import { parseSampleRate } from './parseSampleRate';

const FILE_TYPE_WAV = 'audio/x-wav';

function readFile(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    function onRead(ev: ProgressEvent<FileReader>) {
      if (ev.target === null) {
        reject(new Error('expected target in onRead to be defined'));
        return;
      }

      const bytes = ev.target.result;
      if (bytes === null || typeof bytes === 'string') {
        reject(new Error('invalid data read from audio file'));
        return;
      }

      resolve(bytes);
    }

    const reader = new FileReader();
    reader.onload = onRead;
    reader.readAsArrayBuffer(file);
  });
}

export async function readAudioFile(file: File): Promise<AudioBuffer> {
  if (file.type !== FILE_TYPE_WAV) {
    throw new Error(`expected file to be of type ${FILE_TYPE_WAV}`);
  }

  const bytes = await readFile(file);
  const sampleRate = parseSampleRate('wav', bytes);
  const audioCtx = new AudioContext({ sampleRate });

  return audioCtx.decodeAudioData(bytes);
}
