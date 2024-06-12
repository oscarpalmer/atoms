// src/js/math.ts
function average(values) {
  return values.length > 0 ? sum(values) / values.length : Number.NaN;
}
function max(values) {
  return values.length > 0 ? Math.max(...values) : Number.NaN;
}
function min(values) {
  return values.length > 0 ? Math.min(...values) : Number.NaN;
}
function round(value, decimals) {
  if (typeof decimals !== "number" || decimals < 1) {
    return Math.round(value);
  }
  const mod = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * mod) / mod;
}
function sum(values) {
  return values.reduce((previous, current) => previous + current, 0);
}
export {
  sum,
  round,
  min,
  max,
  average
};
