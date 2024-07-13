// src/js/array/chunk.ts
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

// src/js/array/insert.ts
function insert(array, index, values) {
  insertValues("splice", array, values, index, 0);
}
function insertValues(type, array, values, start, deleteCount) {
  const chunked = chunk(values).reverse();
  const { length } = chunked;
  let returned;
  for (let index = 0;index < length; index += 1) {
    const result = array.splice(start, index === 0 ? deleteCount : 0, ...chunked[index]);
    if (returned == null) {
      returned = result;
    }
  }
  return type === "splice" ? returned : array.length;
}

// src/js/array/index.ts
function compact(array2) {
  return array2.filter((value) => value != null);
}
function push(array2, values) {
  return insertValues("push", array2, values, array2.length, 0);
}

// src/js/internal/array-callbacks.ts
function getCallbacks(bool, key) {
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
}

// src/js/internal/array-find.ts
function findValue(type, array, value, key) {
  const callbacks = getCallbacks(value, key);
  if (callbacks?.bool == null && callbacks?.key == null) {
    return type === "index" ? array.indexOf(value) : array.find((item) => item === value);
  }
  if (callbacks.bool != null) {
    const index = array.findIndex(callbacks.bool);
    return type === "index" ? index : index > -1 ? array[index] : undefined;
  }
  const { length } = array;
  for (let index = 0;index < length; index += 1) {
    const item = array[index];
    if (callbacks.key?.(item, index, array) === value) {
      return type === "index" ? index : item;
    }
  }
  return type === "index" ? -1 : undefined;
}
function findValues(type, array, value, key) {
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
  for (let index = 0;index < length; index += 1) {
    const item = array[index];
    const itemKey = hasCallback ? callbacks.key?.(item, index, array) : item;
    if (type === "all" && itemKey === value || type === "unique" && values.indexOf(itemKey) === -1) {
      if (values !== result) {
        values.push(itemKey);
      }
      result.push(item);
    }
  }
  return result;
}

// src/js/array/exists.ts
function exists(array, value, key) {
  return findValue("index", array, value, key) > -1;
}
// src/js/array/filter.ts
function filter(array, value, key) {
  return findValues("all", array, value, key);
}
// src/js/array/find.ts
function find(array, value, key) {
  return findValue("value", array, value, key);
}
// src/js/array/group-by.ts
function groupBy(array, key) {
  return groupValues(array, key, true, false);
}
function groupValues(array, key, arrays, indicable) {
  const callbacks = getCallbacks(undefined, key);
  const hasCallback = typeof callbacks?.key === "function";
  if (!hasCallback && !indicable) {
    return {};
  }
  const record = {};
  const { length } = array;
  for (let index = 0;index < length; index += 1) {
    const value = array[index];
    const key2 = hasCallback ? callbacks?.key?.(value, index, array) ?? index : index;
    if (arrays) {
      const existing = record[key2];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        record[key2] = [value];
      }
    } else {
      record[key2] = value;
    }
  }
  return record;
}
// src/js/array/index-of.ts
function indexOf(array, value, key) {
  return findValue("index", array, value, key);
}
// src/js/is.ts
function isKey(value) {
  return typeof value === "number" || typeof value === "string";
}

// src/js/array/sort.ts
var comparison = function(first, second) {
  if (typeof first === "number" && typeof second === "number") {
    return first - second;
  }
  const firstAsNumber = Number(first);
  const secondAsNumber = Number(second);
  return Number.isNaN(firstAsNumber) || Number.isNaN(secondAsNumber) ? String(first).localeCompare(String(second)) : firstAsNumber - secondAsNumber;
};
function sort(array2, first, second) {
  if (array2.length < 2) {
    return array2;
  }
  if (first == null || typeof first === "boolean") {
    return first === true ? array2.sort((first2, second2) => second2 - first2) : array2.sort();
  }
  const direction = second === true ? "desc" : "asc";
  const keys = (Array.isArray(first) ? first : [first]).map((key) => {
    const returned = {
      direction,
      callback: undefined
    };
    if (isKey(key)) {
      returned.callback = (value) => value[key];
    } else if (typeof key === "function") {
      returned.callback = key;
    } else if (typeof key?.value === "function" || isKey(key?.value)) {
      returned.direction = key?.direction ?? direction;
      returned.callback = typeof key.value === "function" ? key.value : (value) => value[key.value];
    }
    return returned;
  }).filter((key) => typeof key.callback === "function");
  const { length } = keys;
  if (length === 0) {
    return direction === "asc" ? array2.sort() : array2.sort((first2, second2) => second2 - first2);
  }
  if (length === 1) {
    return array2.sort((first2, second2) => comparison(keys[0].callback(first2), keys[0].callback(second2)) * (keys[0].direction === "asc" ? 1 : -1));
  }
  const sorted = array2.sort((first2, second2) => {
    for (let index = 0;index < length; index += 1) {
      const { callback, direction: direction2 } = keys[index];
      const descending = direction2 === "desc";
      const compared = comparison(callback(descending ? second2 : first2), callback(descending ? first2 : second2));
      if (compared !== 0) {
        return compared;
      }
    }
    return 0;
  });
  return sorted;
}
// src/js/array/splice.ts
function splice(array2, start, amountOrValues, values) {
  const amoutOrValuesIsArray = Array.isArray(amountOrValues);
  return insertValues("splice", array2, amoutOrValuesIsArray ? amountOrValues : values ?? [], start, amoutOrValuesIsArray ? array2.length : typeof amountOrValues === "number" && amountOrValues > 0 ? amountOrValues : 0);
}
// src/js/array/to-map.ts
function toMap(array2, first, second) {
  const asArrays = first === true || second === true;
  const callbacks = getCallbacks(undefined, first);
  const hasCallback = typeof callbacks?.key === "function";
  const map = new Map;
  const { length } = array2;
  for (let index = 0;index < length; index += 1) {
    const value = array2[index];
    const key = hasCallback ? callbacks?.key?.(value, index, array2) ?? index : index;
    if (asArrays) {
      const existing = map.get(key);
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        map.set(key, [value]);
      }
    } else {
      map.set(key, value);
    }
  }
  return map;
}
// src/js/array/to-record.ts
function toRecord(array2, first, second) {
  return groupValues(array2, first, first === true || second === true, true);
}
// src/js/array/unique.ts
function unique(array2, key) {
  return findValues("unique", array2, undefined, key);
}
export {
  unique,
  toRecord,
  toMap,
  splice,
  sort,
  push,
  insert,
  indexOf,
  groupBy,
  find,
  filter,
  exists,
  compact,
  chunk
};
