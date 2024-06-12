// src/js/array.ts
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
var comparison = function(first, second) {
  return [first, second].every((value) => ["bigint", "boolean", "date", "number"].includes(typeof value)) ? Number(first) - Number(second) : String(first).localeCompare(String(second));
};
function exists(array, value, key) {
  return findValue("index", array, value, key) > -1;
}
function filter(array, value, key) {
  return findValues("all", array, value, key);
}
function find(array, value, key) {
  return findValue("value", array, value, key);
}
var findValue = function(type, array, value, key) {
  const callbacks = getCallbacks(value, key);
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
var findValues = function(type, array, value, key) {
  const callbacks = getCallbacks(value, key);
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
var getCallbacks = function(bool, key) {
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
var getSortedValue = function(map, value, callback) {
  if (!map.has(value)) {
    map.set(value, new Map);
  }
  const stored = map.get(value);
  if (stored?.has(callback)) {
    return stored.get(callback);
  }
  const result = callback?.(value) ?? value;
  stored?.set(callback, result);
  return result;
};
function groupBy(array, key) {
  const callbacks = getCallbacks(undefined, key);
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
  return findValue("index", array, value, key);
}
function insert(array, index, values) {
  insertValues("splice", array, values, index, 0);
}
var insertValues = function(type, array, values, start, deleteCount) {
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
function push(array, values) {
  return insertValues("push", array, values, array.length, 0);
}
function sort(array, first, second) {
  if (first == null || typeof first === "boolean") {
    return first === true ? array.sort((first2, second2) => second2 - first2) : array.sort();
  }
  const direction = second === true ? "desc" : "asc";
  const keys = (Array.isArray(first) ? first : [first]).map((key) => {
    if (typeof key === "object") {
      return "value" in key ? {
        direction: key.direction,
        callback: getCallbacks(null, key.value)?.key
      } : null;
    }
    return {
      direction,
      callback: getCallbacks(null, key)?.key
    };
  }).filter((key) => typeof key?.callback === "function");
  const { length } = keys;
  if (length === 0) {
    return second === true ? array.sort((first2, second2) => second2 - first2) : array.sort();
  }
  const store = new Map;
  const sorted = array.sort((first2, second2) => {
    for (let index = 0;index < length; index += 1) {
      const { callback, direction: direction2 } = keys[index];
      if (callback == null) {
        continue;
      }
      const compared = comparison(getSortedValue(store, first2, callback), getSortedValue(store, second2, callback)) * (direction2 === "asc" ? 1 : -1);
      if (compared !== 0) {
        return compared;
      }
    }
    return 0;
  });
  store.clear();
  return sorted;
}
function splice(array, start, amountOrValues, values) {
  const amoutOrValuesIsArray = Array.isArray(amountOrValues);
  return insertValues("splice", array, amoutOrValuesIsArray ? amountOrValues : values ?? [], start, amoutOrValuesIsArray ? array.length : typeof amountOrValues === "number" && amountOrValues > 0 ? amountOrValues : 0);
}
function unique(array, key) {
  return findValues("unique", array, undefined, key);
}
export {
  unique,
  splice,
  sort,
  push,
  insert,
  indexOf,
  groupBy,
  find,
  filter,
  exists,
  chunk
};
