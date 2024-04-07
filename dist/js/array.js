// src/js/array.ts
var _getCallbacks = function(bool, key) {
  if (typeof bool === "function") {
    return { bool };
  }
  if (typeof key === "function") {
    return { key };
  }
  const isString = typeof key === "string";
  if (!isString && typeof key !== "number" || isString && key.includes(".")) {
    return;
  }
  return {
    key: (value) => value?.[key]
  };
};
var _findValue = function(type, array, value, key) {
  const callbacks = _getCallbacks(value, key);
  if (callbacks?.bool == null && callbacks?.key == null) {
    return type === "index" ? array.indexOf(value) : array.find((item) => item === value);
  }
  if (callbacks.bool != null) {
    const index2 = array.findIndex(callbacks.bool);
    return type === "index" ? index2 : index2 > -1 ? array[index2] : undefined;
  }
  const { length } = array;
  let index = 0;
  for (;index < length; index += 1) {
    const item = array[index];
    if (callbacks.key?.(item) === value) {
      return type === "index" ? index : item;
    }
  }
  return type === "index" ? -1 : undefined;
};
var _findValues = function(type, array, value, key) {
  const callbacks = _getCallbacks(value, key);
  const { length } = array;
  if (type === "unique" && callbacks?.key == null && length >= 100) {
    return Array.from(new Set(array));
  }
  if (typeof callbacks?.bool === "function") {
    return array.filter(callbacks.bool);
  }
  if (type === "all" && key == null) {
    return array.filter((item) => item === value);
  }
  const hasCallback = typeof callbacks?.key === "function";
  const result = [];
  const values = hasCallback ? [] : result;
  let index = 0;
  for (;index < length; index += 1) {
    const item = array[index];
    const itemValue = hasCallback ? callbacks.key?.(item) : item;
    if (type === "all" && itemValue === value || type === "unique" && values.indexOf(itemValue) === -1) {
      if (values !== result) {
        values.push(itemValue);
      }
      result.push(item);
    }
  }
  return result;
};
var _insertValues = function(type, array, values, start, deleteCount) {
  const chunked = chunk(values).reverse();
  const { length } = chunked;
  let index = 0;
  let returned;
  for (;index < length; index += 1) {
    const result = array.splice(start, index === 0 ? deleteCount : 0, ...chunked[index]);
    if (returned == null) {
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
  return _findValue("index", array, value, key) > -1;
}
function filter(array, value, key) {
  return _findValues("all", array, value, key);
}
function find(array, value, key) {
  return _findValue("value", array, value, key);
}
function groupBy(array, key) {
  const callbacks = _getCallbacks(undefined, key);
  if (callbacks?.key == null) {
    return {};
  }
  const grouped = {};
  const { length } = array;
  let index = 0;
  for (;index < length; index += 1) {
    const item = array[index];
    const value = callbacks.key(item);
    if (value in grouped) {
      grouped[value].push(item);
    } else {
      grouped[value] = [item];
    }
  }
  return grouped;
}
function indexOf(array, value, key) {
  return _findValue("index", array, value, key);
}
function insert(array, index, values) {
  _insertValues("splice", array, values, index, 0);
}
function push(array, values) {
  return _insertValues("push", array, values, array.length, 0);
}
function splice(array, start, amountOrValues, values) {
  const amoutOrValuesIsArray = Array.isArray(amountOrValues);
  return _insertValues("splice", array, amoutOrValuesIsArray ? amountOrValues : values ?? [], start, amoutOrValuesIsArray ? array.length : typeof amountOrValues === "number" && amountOrValues > 0 ? amountOrValues : 0);
}
function unique(array, key) {
  return _findValues("unique", array, undefined, key);
}
export {
  unique,
  splice,
  push,
  insert,
  indexOf,
  groupBy,
  find,
  filter,
  exists,
  chunk
};
