import {
  calculate_early_decay_time as wasmCalculateEarlyDecayTime,
  calculate_t20 as wasmCalculateT20,
} from 'opra-wasm-module';
import { createOctaveBandParameterImplementation } from '../param-implementation';

export const EARLY_DECAY_TIME = createOctaveBandParameterImplementation(
  'earlyDecayTime',
  'omnidirectional',
  bands =>
    bands.collect(buffer =>
      wasmCalculateEarlyDecayTime(buffer.getChannel(0), buffer.sampleRate)
    ),
  octaveBandValues =>
    (octaveBandValues.band(500) + octaveBandValues.band(1000)) / 2
);

export const T20 = createOctaveBandParameterImplementation(
  't20',
  'omnidirectional',
  bands =>
    bands.collect(buffer =>
      wasmCalculateT20(buffer.getChannel(0), buffer.sampleRate)
    ),
  octaveBandValues =>
    (octaveBandValues.band(500) + octaveBandValues.band(1000)) / 2
);
