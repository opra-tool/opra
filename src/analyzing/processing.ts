import { octfilt } from '../octave-band-filtering/octave-band-filtering';
import { c50Calc, c80Calc } from './c50c80';
import { calculateCentreTime } from './centre-time';
import { calculateIacc } from './iacc';
import { ImpulseResponseType } from './impulse-response';
import { IRBuffer } from './buffer';
import { reverberationTimes } from './reverberation';
import { correctStarttime } from './starttime';
import { e50Calc, e80Calc, l80Calc } from './early-late-fractions';
import { calculateEarlyLateralEnergyFraction } from './early-lateral-fraction';
import { calculateSquaredIR } from './squared-impulse-response';
import { OctaveBandValues } from './octave-bands';
import { arraySum } from '../math/arrays';

export type IntermediateResults = {
  bandsSquaredSum: OctaveBandValues;
  e50BandsSquaredSum: OctaveBandValues;
  e80BandsSquaredSum: OctaveBandValues;
  l80BandsSquaredSum: OctaveBandValues;
  sideE80BandsSquaredSum?: OctaveBandValues;
  sideL80BandsSquaredSum?: OctaveBandValues;
};

export type Results = {
  /* monaural parameters */
  edtBands: OctaveBandValues;
  reverbTimeBands: OctaveBandValues;
  edt: number;
  reverbTime: number;
  c50Bands: OctaveBandValues;
  c80Bands: OctaveBandValues;
  c50: number;
  c80: number;
  centreTime: number;
  bassRatio: number;
  /* strength-based monaural parameters */
  soundStrengthBands?: OctaveBandValues;
  earlySoundStrengthBands?: OctaveBandValues;
  lateSoundStrengthBands?: OctaveBandValues;
  soundStrength?: number;
  earlySoundStrength?: number;
  lateSoundStrength?: number;
  aWeightedSoundStrength?: number;
  trebleRatio?: number;
  earlyBassLevel?: number;
  levelAdjustedC80?: number;
  /* binaural parameters */
  iacc?: number;
  eiacc?: number;
  iaccBands?: OctaveBandValues;
  eiaccBands?: OctaveBandValues;
  /* mid/side parameters */
  earlyLateralEnergyFractionBands?: OctaveBandValues;
  earlyLateralEnergyFraction?: number;
  earlyLateralSoundLevelBands?: OctaveBandValues;
  lateLateralSoundLevelBands?: OctaveBandValues;
  earlyLateralSoundLevel?: number;
  lateLateralSoundLevel?: number;
};

export async function processImpulseResponse(
  type: ImpulseResponseType,
  buffer: IRBuffer
): Promise<[Results, IntermediateResults, Float32Array]> {
  const starttimeCorrected = correctStarttime(buffer);
  const bands = await octfilt(starttimeCorrected);

  let bandsSquared;

  /**
   * @deprecated
   */
  let rawSamples;
  let iacc;
  let eiacc;
  let eiaccBands;
  let iaccBands;
  let midSideSquaredBands;
  let sideE80BandsSquaredSum;
  let sideL80BandsSquaredSum;
  let earlyLateralEnergyFraction;
  let earlyLateralEnergyFractionBands;
  if (type === 'binaural') {
    iaccBands = bands.collect(calculateIacc);
    eiaccBands = bands.transform(e80Calc).collect(calculateIacc);

    iacc =
      (iaccBands.band(1) +
        iaccBands.band(2) +
        iaccBands.band(3) +
        iaccBands.band(4) +
        iaccBands.band(5) +
        iaccBands.band(6)) /
      6;

    eiacc =
      (eiaccBands.band(1) +
        eiaccBands.band(2) +
        eiaccBands.band(3) +
        eiaccBands.band(4) +
        eiaccBands.band(5) +
        eiaccBands.band(6)) /
      6;

    bandsSquared = bands.transform(band => {
      const leftChannel = band.getChannel(0);
      const rightChannel = band.getChannel(1);
      const newChannel = new Float32Array(band.length);
      for (let i = 0; i < band.length; i++) {
        newChannel[i] = (leftChannel[i] ** 2 + rightChannel[i] ** 2) / 2;
      }
      return new IRBuffer([newChannel], band.sampleRate);
    });

    rawSamples = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      rawSamples[i] = (buffer.getChannel(0)[i] + buffer.getChannel(1)[i]) / 2;
    }
  } else if (type === 'mid-side') {
    midSideSquaredBands = bands.transform(band =>
      band.transform(calculateSquaredIR)
    );
    bandsSquared = midSideSquaredBands.transform(
      band => new IRBuffer(band.getChannel(0), band.sampleRate)
    );
    rawSamples = buffer.getChannel(0);
  } else {
    bandsSquared = bands.transform(band => band.transform(calculateSquaredIR));
    rawSamples = buffer.getChannel(0);
  }

  if (midSideSquaredBands) {
    earlyLateralEnergyFractionBands = midSideSquaredBands.collect(
      calculateEarlyLateralEnergyFraction
    );
    earlyLateralEnergyFraction =
      (earlyLateralEnergyFractionBands.band(1) +
        earlyLateralEnergyFractionBands.band(2) +
        earlyLateralEnergyFractionBands.band(3) +
        earlyLateralEnergyFractionBands.band(4)) /
      4;
    sideE80BandsSquaredSum = midSideSquaredBands
      .transform(e80Calc)
      .collect(band => arraySum(band.getChannel(1)));
    sideL80BandsSquaredSum = midSideSquaredBands
      .transform(l80Calc)
      .collect(band => arraySum(band.getChannel(1)));
  }

  const c50Bands = bandsSquared.collect(c50Calc);
  const c80Bands = bandsSquared.collect(c80Calc);

  const c50 = (c50Bands.band(3) + c50Bands.band(4)) / 2;
  const c80 = (c80Bands.band(3) + c80Bands.band(4)) / 2;

  const { edtBands, reverbTimeBands } = reverberationTimes(bandsSquared);

  const edt = (edtBands.band(3) + edtBands.band(4)) / 2;
  const reverbTime = (reverbTimeBands.band(3) + reverbTimeBands.band(4)) / 2;

  const bassRatio =
    (reverbTimeBands.band(1) + reverbTimeBands.band(2)) /
    (reverbTimeBands.band(3) + reverbTimeBands.band(4));

  const centreTime = calculateCentreTime(bandsSquared);

  const bandsSquaredSum = bandsSquared.sum();
  const e50BandsSquaredSum = bandsSquared.transform(e50Calc).sum();
  const e80BandsSquaredSum = bandsSquared.transform(e80Calc).sum();
  const l80BandsSquaredSum = bandsSquared.transform(l80Calc).sum();

  const results: Results = {
    edtBands,
    reverbTimeBands,
    edt,
    reverbTime,
    c50Bands,
    c80Bands,
    c50,
    c80,
    bassRatio,
    centreTime,
    //
    iacc,
    eiacc,
    iaccBands,
    eiaccBands,
    //
    earlyLateralEnergyFractionBands,
    earlyLateralEnergyFraction,
  };

  return [
    results,
    {
      bandsSquaredSum,
      e50BandsSquaredSum,
      e80BandsSquaredSum,
      l80BandsSquaredSum,
      sideE80BandsSquaredSum,
      sideL80BandsSquaredSum,
    },
    rawSamples.map(sample => sample ** 2),
  ];
}
