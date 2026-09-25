const currentTrace = [
  0.12, 0.42, -0.18, 0.88, -0.51, 0.36, 0.95, -0.22, 0.61, -0.74, 0.28,
  0.69,
];

const historicTrace = [
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
  (pearsonCorrelation(currentTrace, historicTrace) * 100).toFixed(1),
);
