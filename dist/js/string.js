// src/js/string.ts
function createUuid() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (substring) => (substring ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> substring / 4).toString(16));
}
function getString(value) {
  return typeof value === "string" ? value : typeof value?.toString === "function" ? value.toString() : String(value);
}
function isNullableOrWhitespace(value) {
  return value == null || getString(value).trim().length === 0;
}
export {
  isNullableOrWhitespace,
  getString,
  createUuid
};