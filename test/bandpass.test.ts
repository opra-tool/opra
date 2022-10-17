import { expect } from '@esm-bundle/chai';
import { bandpass } from '../src/bandpass';


type Inputs = {
  f1: number;
  f2: number;
  fs: number;
};


it('should calculate coefficients for a 6th order bandpass filter consisting of three biquad filters', () => {
  const order = 6;
  const inputs: Inputs = {
    f1: 44.6683592150963,
    f2: 89.1250938133746,
    fs: 44100,
  };

  const { feedbacks, gains } = bandpass(order, inputs.f1, inputs.f2, inputs.fs);

  expect(gains[0]).to.be.closeTo(0.00428663862901765, 1.0e-3);
  expect(gains[1]).to.be.closeTo(0.00315701794857852, 1.0e-3);
  expect(gains[2]).to.be.closeTo(0.00233241663820367, 1.0e-3);

  expect(feedbacks[0][0]).to.equal(1);
  expect(feedbacks[0][1]).to.be.closeTo(-1.99575668582657, 0.1);
  expect(feedbacks[0][2]).to.be.closeTo(0.995905042790672, 0.1);
  expect(feedbacks[1][0]).to.equal(1);
  expect(feedbacks[1][1]).to.be.closeTo(-1.99360540625776, 0.1);
  expect(feedbacks[1][2]).to.be.closeTo(0.993685964102914, 0.1);
  expect(feedbacks[2][0]).to.equal(1);
  expect(feedbacks[2][1]).to.be.closeTo(-1.99772797929158, 0.1);
  expect(feedbacks[2][2]).to.be.closeTo(0.997771860304699, 0.1);
});
