// src/js/number.ts
function clampNumber(value, min, max) {
  return Math.min(Math.max(getNumber(value), getNumber(min)), getNumber(max));
}
function getNumber(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "symbol") {
    return NaN;
  }
  let parsed = value?.valueOf?.() ?? value;
  if (typeof parsed === "object") {
    parsed = parsed?.toString() ?? parsed;
  }
  if (typeof parsed !== "string") {
    return parsed == null ? NaN : typeof parsed === "number" ? parsed : +parsed;
  }
  if (/^\s*0+\s*$/.test(parsed)) {
    return 0;
  }
  const trimmed = parsed.trim();
  if (trimmed.length === 0) {
    return NaN;
  }
  const isBinary = /^0b[01]+$/i.test(trimmed);
  if (isBinary || /^0o[0-7]+$/i.test(trimmed)) {
    return parseInt(trimmed.slice(2), isBinary ? 2 : 8);
  }
  return +(/^0x[0-9a-f]+$/i.test(trimmed) ? trimmed : trimmed.replace(/_/g, ""));
}
export {
  getNumber,
  clampNumber
};
