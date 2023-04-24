type Point = {
  x: number;
  y: number;
};

/**
 * Perform the largest triangle three buckets algorithm,
 * as described by Sveinn Steinarsson, 2013.
 *
 * https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf
 */
export function largestTriangleThreeBuckets(
  data: Point[],
  threshold: number
): Point[] {
  if (threshold >= data.length || threshold === 0) {
    return data;
  }

  const sampled = [];

  // Leave room for start and end data points
  const bucketSize = (data.length - 2) / (threshold - 2);

  let a = 0; // Initially a is the first point in the triangle
  let maxArea;
  let maxAreaPoint;
  let area;
  let nextA = 0;

  let sampledIndex = 0;
  sampled[sampledIndex] = data[a]; // Always add the first point
  sampledIndex += 1;

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate point average for next bucket (containing c)
    let avgX = 0;
    let avgY = 0;
    let avgRangeStart = Math.floor((i + 1) * bucketSize) + 1;
    const avgRangeEnd = Math.min(
      Math.floor((i + 2) * bucketSize) + 1,
      data.length
    );

    const avgRangeLength = avgRangeEnd - avgRangeStart;

    for (; avgRangeStart < avgRangeEnd; avgRangeStart += 1) {
      avgX += data[avgRangeStart].x;
      avgY += data[avgRangeStart].y;
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    // Get the range for this bucket
    let rangeOffs = Math.floor(i * bucketSize) + 1;
    const rangeTo = Math.floor((i + 1) * bucketSize) + 1;

    // Point a
    const pointAX = data[a].x;
    const pointAY = data[a].y;

    maxArea = -1;
    area = -1;

    for (; rangeOffs < rangeTo; rangeOffs += 1) {
      // Calculate triangle area over three buckets
      area =
        Math.abs(
          (pointAX - avgX) * (data[rangeOffs].y - pointAY) -
            (pointAX - data[rangeOffs].x) * (avgY - pointAY)
        ) * 0.5;
      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[rangeOffs];
        nextA = rangeOffs; // Next a is this b
      }
    }

    if (!maxAreaPoint) {
      throw new Error('expected maxAreaPoint to be defined');
    }

    sampled[sampledIndex] = maxAreaPoint; // Pick this point from the bucket
    sampledIndex += 1;
    a = nextA; // This a is the next a (chosen b)
  }

  sampled[sampledIndex] = data[data.length - 1]; // Always add last

  return sampled;
}
