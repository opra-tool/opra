import { parseSampleRate } from './sample-rate-parsing';

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
  const bytes = await readFile(file);
  const sampleRate = parseSampleRate(file.type, bytes);
  const audioCtx = new AudioContext({ sampleRate });

  return audioCtx.decodeAudioData(bytes);
}
