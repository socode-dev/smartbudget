export const getMedian = (arr) => {
  if (!arr || arr.length === 0) {
    return NaN; // or throw new Error('Cannot compute median of empty array')
  }
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const getMAD = (arr, median) => {
  if (!arr || arr.length === 0) {
    return NaN;
  }
  const dev = arr.map((value) => Math.abs(value - median));
  return getMedian(dev);
};

export const getRiskScore = (z) => {
  if (z >= 7) return 90;
  if (z >= 5) return 82;
  if (z >= 3) return 65;
  return 40;
};
