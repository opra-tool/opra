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
import { binauralToMidSide, binauralToMonaural } from '../conversion';
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
      (iaccBands.band(125) +
        iaccBands.band(250) +
        iaccBands.band(500) +
        iaccBands.band(1000) +
        iaccBands.band(2000) +
        iaccBands.band(4000)) /
      6;

    eiacc =
      (eiaccBands.band(125) +
        eiaccBands.band(250) +
        eiaccBands.band(500) +
        eiaccBands.band(1000) +
        eiaccBands.band(2000) +
        eiaccBands.band(4000)) /
      6;

    const monauralBuffer = await binauralToMonaural(starttimeCorrected);
    bandsSquared = (await octfilt(monauralBuffer)).transform(band =>
      band.transform(calculateSquaredIR)
    );

    midSideSquaredBands = bands
      .transform(binauralToMidSide)
      .transform(band => band.transform(calculateSquaredIR));

    rawSamples = monauralBuffer.getChannel(0);
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
      (earlyLateralEnergyFractionBands.band(125) +
        earlyLateralEnergyFractionBands.band(250) +
        earlyLateralEnergyFractionBands.band(500) +
        earlyLateralEnergyFractionBands.band(1000)) /
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

  const c50 = (c50Bands.band(500) + c50Bands.band(1000)) / 2;
  const c80 = (c80Bands.band(500) + c80Bands.band(1000)) / 2;

  const { edtBands, reverbTimeBands } = reverberationTimes(bandsSquared);

  const edt = (edtBands.band(500) + edtBands.band(1000)) / 2;
  const reverbTime =
    (reverbTimeBands.band(500) + reverbTimeBands.band(1000)) / 2;

  const bassRatio =
    (reverbTimeBands.band(125) + reverbTimeBands.band(250)) /
    (reverbTimeBands.band(500) + reverbTimeBands.band(1000));

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
