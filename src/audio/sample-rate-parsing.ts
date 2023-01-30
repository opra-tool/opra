import CodecParser, { CodecFrame, MimeType, OggPage } from 'codec-parser';

// from https://docs.fileformat.com/audio/wav/
const WAVE_HEADER_OFFSET = 24;
const WAVE_HEADER_LENGTH = 4;

function parseWavSampleRate(bytes: ArrayBuffer): number {
  const sampleRateBytes = bytes.slice(
    WAVE_HEADER_OFFSET,
    WAVE_HEADER_OFFSET + WAVE_HEADER_LENGTH
  );

  const fs = new DataView(sampleRateBytes).getInt32(0, true);

  return fs;
}

function parseOtherSampleRate(mimeType: string, bytes: ArrayBuffer): number {
  let parser;
  try {
    parser = new CodecParser<CodecFrame | OggPage>(mimeType as MimeType, {
      enableLogging: true,
    });
  } catch (e) {
    if (e instanceof ReferenceError) {
      throw new Error(`unsupported file type ${mimeType}`);
    }

    throw e;
  }

  const rawBytes = new Uint8Array(bytes);

  const iterator = parser.parseChunk(rawBytes);

  let sampleRate = 0;
  while (sampleRate === 0) {
    const frameOrPage = iterator.next().value;

    if (isOggPage(frameOrPage) && frameOrPage.codecFrames.length) {
      sampleRate = frameOrPage.codecFrames[0].header.sampleRate;
    }

    if (isCodecFrame(frameOrPage)) {
      sampleRate = frameOrPage.header.sampleRate;
    }

    if (frameOrPage === undefined) {
      // reached end of file
      throw new Error('could not determine sample rate');
    }
  }

  return sampleRate;
}

export function parseSampleRate(mimeType: string, bytes: ArrayBuffer): number {
  if (isWavFile(mimeType)) {
    return parseWavSampleRate(bytes);
  }

  return parseOtherSampleRate(mimeType, bytes);
}

function isOggPage(value: unknown): value is OggPage {
  return !!value && Object.keys(value).includes('isFirstPage');
}

function isCodecFrame(value: unknown): value is CodecFrame {
  return !!value && Object.keys(value).includes('frameNumber');
}

function isWavFile(mimeType: string): boolean {
  return /audio\/(x-)?wav/.test(mimeType);
}
