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
var _insertValues = function(type, array, values, start, deleteCount) {
  const chunked = chunk(values).reverse();
  const { length } = chunked;
  let index = 0;
  let returned;
  for (;index < length; index += 1) {
    const result = array.splice(start, index === 0 ? deleteCount : 0, ...chunked[index]);
    if (returned === undefined) {
      returned = result;
    }
  }
  return type === "splice" ? returned : array.length;
};
function chunk(array, size) {
  const { length } = array;
  const chunkSize = typeof size === "number" && size > 0 ? size : 32000;
  if (length <= chunkSize) {
    return [array];
  }
  const chunks = [];
  let remaining = Number(length);
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
function insert(array, index, values) {
  _insertValues("splice", array, values, index, 0);
}
function push(array, values) {
  return _insertValues("push", array, values, array.length, 0);
}
function splice(array, start, deleteCount, values) {
  return _insertValues("splice", array, values, start, deleteCount);
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
  splice,
  push,
  insert,
  groupBy,
  exists,
  chunk
};
