// src/js/string.ts
function capitalise(value) {
  if (value.length === 0) {
    return value;
  }
  return value.length === 1 ? value.toLocaleUpperCase() : value.charAt(0).toLocaleUpperCase() + value.slice(1).toLocaleLowerCase();
}
function createUuid() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (substring) => (substring ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> substring / 4).toString(16));
}
function getString(value) {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value !== "object" || value == null) {
    return String(value);
  }
  const valueOff = value.valueOf?.() ?? value;
  const asString = valueOff?.toString?.() ?? String(valueOff);
  return asString.startsWith("[object ") ? JSON.stringify(value) : asString;
}
function titleCase(value) {
  return value.split(/\s+/).map((word) => capitalise(word)).join(" ");
}
function truncate(value, length, suffix) {
  const suffixLength = suffix?.length ?? 0;
  const truncatedLength = length - suffixLength;
  return value.length <= length ? value : `${value.slice(0, truncatedLength)}${suffix ?? ""}`;
}
function words(value) {
  return [];
}
export {
  words,
  truncate,
  titleCase,
  getString,
  createUuid,
  capitalise as capitalize,
  capitalise
};
