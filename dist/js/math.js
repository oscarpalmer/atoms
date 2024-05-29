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
function sum(values) {
  return values.reduce((a, b) => a + b, 0);
}
export {
  sum,
  min,
  max,
  average
};
