// src/js/value.ts
function getValue(data, key) {
  if (typeof data !== "object" || data === null || isNullableOrWhitespace(key)) {
    return;
  }
  const parts = getString(key).split(".");
  const length = parts.length;
  let index = 0;
  let value = data;
  while (typeof value === "object" && value !== null && index < length) {
    value = value[parts[index++]];
  }
  return value;
}
function isNullable(value) {
  return value === undefined || value === null;
}

// src/js/string.ts
function createUuid() {
  return uuidTemplate.replace(/[018]/g, (substring) => (substring ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> substring / 4).toString(16));
}
function getString(value2) {
  return typeof value2 === "string" ? value2 : String(value2);
}
function isNullableOrWhitespace(value2) {
  return isNullable(value2) || getString(value2).trim().length === 0;
}
var uuidTemplate = "10000000-1000-4000-8000-100000000000";
export {
  isNullableOrWhitespace,
  isNullable,
  getValue,
  getString,
  createUuid
};
