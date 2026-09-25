export const CURRENT_TRACE = [
  0.12, 0.42, -0.18, 0.88, -0.51, 0.36, 0.95, -0.22, 0.61, -0.74, 0.28,
  0.69,
];

export const HISTORIC_TRACE = [
  0.08947903, -0.12813587, -0.31701823, 1.18796878, -0.3717308, 0.4222284,
  1.20216709, -0.09888664, 0.9144313, -0.51014408, 0.66042511, 0.77969902,
];

export function pearsonCorrelation(a: number[], b: number[]) {
  if (a.length !== b.length || a.length < 2) {
    throw new Error("Waveform traces must have the same sample count.");
  }

  const mean = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0) / values.length;

  const meanA = mean(a);
  const meanB = mean(b);

  let numerator = 0;
  let sumSquaresA = 0;
  let sumSquaresB = 0;

  for (let index = 0; index < a.length; index += 1) {
    const deltaA = a[index] - meanA;
    const deltaB = b[index] - meanB;

    numerator += deltaA * deltaB;
    sumSquaresA += deltaA * deltaA;
    sumSquaresB += deltaB * deltaB;
  }

  const denominator = Math.sqrt(sumSquaresA * sumSquaresB);

  if (denominator === 0) return 0;

  return numerator / denominator;
}

export const WAVEFORM_MATCH_PERCENT = Number(
  (pearsonCorrelation(CURRENT_TRACE, HISTORIC_TRACE) * 100).toFixed(1),
);

const TRACE_VALUES = [...CURRENT_TRACE, ...HISTORIC_TRACE];
const TRACE_MIN = Math.min(...TRACE_VALUES);
const TRACE_MAX = Math.max(...TRACE_VALUES);

export function toWaveformPoints(
  values: number[],
  width = 100,
  height = 100,
  padding = 8,
) {
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const range = TRACE_MAX - TRACE_MIN || 1;

  return values
    .map((value, index) => {
      const x =
        padding +
        (values.length === 1 ? 0 : (index / (values.length - 1)) * usableWidth);
      const normalized = (value - TRACE_MIN) / range;
      const y = padding + (1 - normalized) * usableHeight;

      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}
