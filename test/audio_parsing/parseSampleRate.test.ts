import { expect } from '@esm-bundle/chai';
import { parseSampleRate } from '../../src/audio_parsing/parseSampleRate';
import { arrayMaxAbs } from '../../src/math/arrayMaxAbs';

it('should parse a wav sample rate', () => {
  const buffer = new ArrayBuffer(45);
  const view = new Uint8Array(buffer);
  view.set([82,73,70,70,70,96,12,0,87,65,86,69,102,109,116,32,16,0,0,0,1,0,2,0,68,172,0,0,16,177,2,0,4,0,16,0,76,73,83,84,26,0,0,0,73]);
  
  const fs = parseSampleRate("wav", view.buffer);

  expect(fs).to.equal(44100);
});
