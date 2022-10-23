// from https://docs.fileformat.com/audio/wav/
const WAVE_HEADER_OFFSET = 24;
const WAVE_HEADER_LENGTH = 4;

function parseWaveSampleRate(bytes: ArrayBuffer): number {  
  const sampleRateBytes = bytes.slice(WAVE_HEADER_OFFSET, WAVE_HEADER_OFFSET + WAVE_HEADER_LENGTH);

  const fs = new DataView(sampleRateBytes).getInt32(0, true);

  return fs;
}

export function parseSampleRate(fileFormat: string, bytes: ArrayBuffer): number {
  switch(fileFormat) {
    case "wav":
      return parseWaveSampleRate(bytes);
    default:
      throw new Error(`sample rate parsing not implemented for format ${fileFormat}`);
  }
}
