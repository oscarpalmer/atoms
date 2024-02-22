// src/js/number.ts
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

// src/js/array.ts
var _getCallback = function(value) {
  if (typeof value === "function") {
    return value;
  }
  const isString = typeof value === "string";
  if (!isString && typeof value !== "number") {
    return;
  }
  return isString && value.includes(".") ? undefined : (item) => item[value];
};
function chunk(array, size) {
  const chunks = [];
  const chunkSize = getNumber(size);
  let remaining = Number(array.length);
  while (remaining > 0) {
    chunks.push(array.splice(0, chunkSize));
    remaining -= chunkSize;
  }
  return chunks;
}
function exists(array, value, key) {
  const callback = _getCallback(key);
  if (callback === undefined) {
    return array.indexOf(value) > -1;
  }
  const needle = typeof value === "object" && value !== null ? callback(value) : value;
  const { length } = array;
  let index = 0;
  for (;index < length; index += 1) {
    if (callback(array[index]) === needle) {
      return true;
    }
  }
  return false;
}
function groupBy(array, key) {
  const keyCallback = _getCallback(key);
  if (keyCallback === undefined) {
    return {};
  }
  const grouped = {};
  const { length } = array;
  let index = 0;
  for (;index < length; index += 1) {
    const item = array[index];
    const value = keyCallback(item);
    if (value in grouped) {
      grouped[value].push(item);
    } else {
      grouped[value] = [item];
    }
  }
  return grouped;
}
function unique(array, key) {
  const keyCallback = _getCallback(key);
  const { length } = array;
  if (keyCallback === undefined && length >= 100) {
    return Array.from(new Set(array));
  }
  const result = [];
  const values = keyCallback === undefined ? result : [];
  let index = 0;
  for (;index < length; index += 1) {
    const item = array[index];
    const value = keyCallback?.(item) ?? item;
    if (values.indexOf(value) === -1) {
      if (values !== result) {
        values.push(value);
      }
      result.push(item);
    }
  }
  return result;
}
export {
  unique,
  groupBy,
  exists,
  chunk
};
