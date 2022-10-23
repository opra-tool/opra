/**
 * General Stuff
 * http://www.sengpielaudio.com/calculator-cutoffFrequencies.htm
 * 
 * Matlab
 * https://www.mathworks.com/help/signal/ref/designfilt.html
 * https://www.mathworks.com/help/matlab/ref/filter.html
 * https://de.mathworks.com/matlabcentral/answers/564182-numerator-and-denominator-coefficients-from-designfilt-function
 * 
 * Web Audio API
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_IIR_filters
 * https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext
 * 
 * Might be needed when calculating coefficients
 * https://mathjs.org/
 * https://www.dsprelated.com/showarticle/1128.php
 * https://github.com/markert/fili.js
 * 
 * Matlab Generation Code
      clc;
      clear;

      Fs=44100;
      F=[44.6683592150963;89.1250938133746; 177.827941003892;354.813389233576;707.945784384138;1412.53754462275;2818.38293126445;5623.41325190349;11220.1845430196];


      for i = 1:size(F)-1
          raqi_filter = designfilt('bandpassiir','FilterOrder',6, 'HalfPowerFrequency1',F(i),'HalfPowerFrequency2',F(i+1),'SampleRate',Fs);
          [b, a] = sos2tf(raqi_filter.Coefficients);
          params_a(i,:) = a;
          params_b(i,:) = b;
      end
 */

import { bandpass } from "./bandpass";

// see filter_test.m for generation
// const COEFFICIENTS = [
//   {
//     a: [1, -5.98709007137590, 14.9357744565192, -19.8721947732521, 14.8728383205192, -5.93673979039553, 0.987411857985702],
//     b: [3.15645829146102e-08, 0, -9.46937487438307e-08, 0, 9.46937487438307e-08, 0, -3.15645829146102e-08]
//   },
//   {
//     a: [1, -5.97376304868478, 14.8701112288395, -19.7427955543387, 14.7453501914756, -5.87394338918693, 0.975040571928284],
//     b: [2.49158217374706e-07, 0, -7.47474652124118e-07, 0, 7.47474652124118e-07, 0, -2.49158217374706e-07]
//   },
//   {
//     a: [1, -5.94575911833107, 14.7340015276791, -19.4782603830221, 14.4883697607572, -5.74916880469637, 0.950817019661672],
//     b: [1.95462767252710e-06, 0, -5.86388301758131e-06, 0, 5.86388301758131e-06, 0, -1.95462767252710e-06]
//   },
//   {
//     a: [1, -5.88434772890337, 14.4428497052628, -18.9266220447669, 13.9663504802696, -5.50249213752803, 0.904261851650064],
//     b: [1.51484611202262e-05, 0, -4.54453833606785e-05, 0, 4.54453833606785e-05, 0, -1.51484611202262e-05]
//   },
//   {
//     a: [1, -5.74049791990531, 13.7898327889774, -17.7429322794105, 12.8964753692610, -5.02089805606622, 0.818027643229796],
//     b: [0.000114663535858316, 0, -0.000343990607574947, 0, 0.000343990607574947, 0, -0.000114663535858316]
//   },
//   {
//     a: [1, -5.37453844758330, 12.2495482323111, -15.1460073982420, 10.7139782824671, -4.11201941322191, 0.669466201232406],
//     b: [0.000830189518035075, 0, -0.00249056855410523, 0, 0.00249056855410523, 0, -0.000830189518035075]
//   },
//   {
//     a: [1, -4.37938014377162, 8.65205951347569, -9.75204477796249, 6.60992951552333, -2.55633485273906, 0.447154146625003],
//     b: [0.00555513817081230, 0, -0.0166654145124369, 0, 0.0166654145124369, 0, -0.00555513817081230]
//   },
//   {
//     a: [1, -1.74473462766489, 2.48251146245516, -2.04552451499376, 1.47948421141557, -0.578072937315542, 0.192604672942667],
//     b: [0.0329014484731292, 0, -0.0987043454193875, 0, 0.0987043454193875, 0, -0.0329014484731292]
//   }
// ];

/**
 * 
 * @param data 
 * @param fs 
 * @returns 
 */
export async function octfilt(data: Float64Array, fs: number): Promise<Float64Array[]> {
  const F = [44.6683592150963, 89.1250938133746, 177.827941003892, 354.813389233576, 707.945784384138, 1412.53754462275, 2818.38293126445, 5623.41325190349, 11220.1845430196];
  
  const audioBuffer = new AudioBuffer({
    numberOfChannels: 1,
    length: data.length,
    sampleRate: fs
  });
  
  // TODO: copyChannelData()?
  const channel = audioBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    channel[i] = data[i];
  }
  
  const promises = [];
  for (let i = 0; i < F.length - 1; i += 1) {
    const f1 = F[i];
    const f2 = F[i + 1];
    
    promises.push(calc(audioBuffer, f1, f2, fs));
  }
  
  return Promise.all(promises);
}

function calc(buffer: AudioBuffer, f1: number, f2: number, fs: number): Promise<Float64Array> {
  const offlineCtx = new OfflineAudioContext(1, buffer.length, fs);

  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;

  const b = [1, 0, -1];
  const filterOrder = 6;

  const { feedbacks, gains } = bandpass(filterOrder, f1, f2, fs);

  const filters = [];
  for (let ii = 0; ii < filterOrder / 2; ii += 1) {
    const feedback = feedbacks[ii];
    const feedforward = b.map(val => val * gains[ii]);
    const filter = offlineCtx.createIIRFilter(feedforward, feedback);
    filters.push(filter);
  }
  source.connect(filters[0]);
  for (let ii = 1; ii < filters.length; ii += 1) {
    filters[ii - 1].connect(filters[ii]);
  }
  filters[filters.length - 1].connect(offlineCtx.destination);
  
  source.start();

  return new Promise((resolve) => {
    offlineCtx.startRendering().then((renderedBuffer) => {
      resolve(Float64Array.from(renderedBuffer.getChannelData(0)));
    });
  });
}
