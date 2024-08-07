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
  const chunked = chunk(values);
  const lastIndex = chunked.length - 1;
  let index = Number(chunked.length);
  let returned;
  while (--index >= 0) {
    const result = array.splice(start, index === lastIndex ? deleteCount : 0, ...chunked[index]);
    if (returned == null) {
      returned = result;
    }
  }
  return type === "splice" ? returned : array.length;
}

// src/js/array/index.ts
function flatten2(array2) {
  return array2.flat(Number.POSITIVE_INFINITY);
}
function push(array2, values) {
  return insertValues("push", array2, values, array2.length, 0);
}

// src/js/array/compact.ts
function compact(array, strict) {
  return strict === true ? array.filter((item) => !!item) : array.filter((item) => item != null);
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

// src/js/array/count.ts
function count(array, value, key) {
  return findValues("all", array, value, key).length;
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
// src/js/random.ts
function getRandomBoolean() {
  return Math.random() > 0.5;
}
function getRandomCharacters(length, selection) {
  if (length < 1) {
    return "";
  }
  const actualSelection = typeof selection === "string" && selection.length > 0 ? selection : "abcdefghijklmnopqrstuvwxyz";
  let characters = "";
  for (let index = 0;index < length; index += 1) {
    characters += actualSelection.charAt(getRandomInteger(0, actualSelection.length));
  }
  return characters;
}
function getRandomColour() {
  return `#${Array.from({ length: 6 }, getRandomHex).join("")}`;
}
function getRandomDate(earliest, latest) {
  const earliestTime = earliest?.getTime() ?? -8640000000000000;
  const latestTime = latest?.getTime() ?? 8640000000000000;
  return new Date(getRandomInteger(earliestTime, latestTime));
}
function getRandomFloat(min, max) {
  const minimum = min ?? Number.MIN_SAFE_INTEGER;
  return Math.random() * ((max ?? Number.MAX_SAFE_INTEGER) - minimum) + minimum;
}
function getRandomHex() {
  return "0123456789ABCDEF"[getRandomInteger(0, 16)];
}
function getRandomInteger(min, max) {
  return Math.floor(getRandomFloat(min, max));
}
function getRandomItem(array) {
  return array[getRandomInteger(0, array.length)];
}
function getRandomItems(array, amount) {
  if (amount === 1) {
    return array.length === 0 ? [] : [array[getRandomInteger(0, array.length)]];
  }
  return amount == null || amount >= array.length ? shuffle2(array) : shuffle2(array).slice(0, amount);
}

// src/js/array/shuffle.ts
function shuffle2(array) {
  const shuffled = array.slice();
  const { length } = shuffled;
  for (let index = 0;index < length; index += 1) {
    const random2 = getRandomInteger(0, length);
    [shuffled[index], shuffled[random2]] = [shuffled[random2], shuffled[index]];
  }
  return shuffled;
}
// src/js/string/index.ts
function createUuid() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (substring) => (substring ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> substring / 4).toString(16));
}
function getString(value2) {
  if (typeof value2 === "string") {
    return value2;
  }
  if (typeof value2 !== "object" || value2 == null) {
    return String(value2);
  }
  const valueOff = value2.valueOf?.() ?? value2;
  const asString = valueOff?.toString?.() ?? String(valueOff);
  return asString.startsWith("[object ") ? JSON.stringify(value2) : asString;
}
function join(value2, delimiter) {
  return compact(value2).map(getString).filter((value3) => value3.trim().length > 0).join(typeof delimiter === "string" ? delimiter : "");
}
function parse(value2, reviver) {
  try {
    return JSON.parse(value2, reviver);
  } catch {
  }
}
function truncate(value2, length, suffix) {
  const suffixLength = suffix?.length ?? 0;
  const truncatedLength = length - suffixLength;
  return value2.length <= length ? value2 : `${value2.slice(0, truncatedLength)}${suffix ?? ""}`;
}
function words(value2) {
  return value2.match(/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g) ?? [];
}

// src/js/string/case.ts
function camelCase(value) {
  return toCase(value, "", true, false);
}
function capitalise(value) {
  if (value.length === 0) {
    return value;
  }
  return value.length === 1 ? value.toLocaleUpperCase() : `${value.charAt(0).toLocaleUpperCase()}${value.slice(1).toLocaleLowerCase()}`;
}
function kebabCase(value) {
  return toCase(value, "-", false, false);
}
function pascalCase(value) {
  return toCase(value, "", true, true);
}
function snakeCase(value) {
  return toCase(value, "_", false, false);
}
function titleCase(value) {
  return words(value).map(capitalise).join(" ");
}
function toCase(value, delimiter, capitaliseAny, capitaliseFirst) {
  return words(value).map((word, index) => {
    const parts = word.replace(/(\p{Lu}*)(\p{Lu})(\p{Ll}+)/gu, (full, one, two, three) => three === "s" ? full : `${one}-${two}${three}`).replace(/(\p{Ll})(\p{Lu})/gu, "$1-$2").split("-");
    return parts.filter((part) => part.length > 0).map((part, partIndex) => !capitaliseAny || partIndex === 0 && index === 0 && !capitaliseFirst ? part.toLocaleLowerCase() : capitalise(part)).join(delimiter);
  }).join(delimiter);
}
// src/js/value/index.ts
function partial(value, keys) {
  const result = {};
  const { length } = keys;
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    result[key] = value[key];
  }
  return result;
}

// src/js/value/clone.ts
function clone(value) {
  switch (true) {
    case value == null:
      return value;
    case typeof value === "bigint":
      return BigInt(value);
    case typeof value === "boolean":
      return Boolean(value);
    case typeof value === "function":
      return;
    case typeof value === "number":
      return Number(value);
    case typeof value === "string":
      return String(value);
    case typeof value === "symbol":
      return Symbol(value.description);
    case value instanceof ArrayBuffer:
      return cloneArrayBuffer(value);
    case value instanceof DataView:
      return cloneDataView(value);
    case value instanceof Map:
    case value instanceof Set:
      return cloneMapOrSet(value);
    case value instanceof Node:
      return value.cloneNode(true);
    case value instanceof RegExp:
      return cloneRegularExpression(value);
    case isArrayOrPlainObject(value):
      return cloneObject(value);
    default:
      return structuredClone(value);
  }
}
function cloneArrayBuffer(value) {
  const cloned = new ArrayBuffer(value.byteLength);
  new Uint8Array(cloned).set(new Uint8Array(value));
  return cloned;
}
function cloneDataView(value) {
  const buffer = cloneArrayBuffer(value.buffer);
  return new DataView(buffer, value.byteOffset, value.byteLength);
}
function cloneMapOrSet(value) {
  const isMap = value instanceof Map;
  const cloned = isMap ? new Map : new Set;
  const entries = [...value.entries()];
  const { length } = entries;
  for (let index = 0;index < length; index += 1) {
    const entry = entries[index];
    if (isMap) {
      cloned.set(clone(entry[0]), clone(entry[1]));
    } else {
      cloned.add(clone(entry[0]));
    }
  }
  return cloned;
}
function cloneObject(value) {
  const cloned = Array.isArray(value) ? [] : {};
  const keys = Object.keys(value);
  const { length } = keys;
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    cloned[key] = clone(value[key]);
  }
  return cloned;
}
function cloneRegularExpression(value) {
  const cloned = new RegExp(value.source, value.flags);
  cloned.lastIndex = value.lastIndex;
  return cloned;
}
// src/js/value/equal.ts
function equal(first, second, ignoreCase) {
  switch (true) {
    case first === second:
      return true;
    case (first == null || second == null):
      return first === second;
    case typeof first !== typeof second:
      return false;
    case (first instanceof ArrayBuffer && second instanceof ArrayBuffer):
      return equalArrayBuffer(first, second);
    case typeof first === "boolean":
    case (first instanceof Date && second instanceof Date):
      return Object.is(Number(first), Number(second));
    case (first instanceof DataView && second instanceof DataView):
      return equalDataView(first, second);
    case (first instanceof Error && second instanceof Error):
      return equalProperties(first, second, ["name", "message"]);
    case (first instanceof Map && second instanceof Map):
      return equalMap(first, second);
    case (first instanceof RegExp && second instanceof RegExp):
      return equalProperties(first, second, ["source", "flags"]);
    case (first instanceof Set && second instanceof Set):
      return equalSet(first, second);
    case (Array.isArray(first) && Array.isArray(second)):
    case (isPlainObject(first) && isPlainObject(second)):
      return equalObject(first, second);
    case (typeof first === "string" && ignoreCase === true):
      return Object.is(first.toLowerCase(), second.toLowerCase());
    default:
      return Object.is(first, second);
  }
}
function equalArrayBuffer(first, second) {
  return first.byteLength === second.byteLength ? equalObject(new Uint8Array(first), new Uint8Array(second)) : false;
}
function equalDataView(first, second) {
  return first.byteOffset === second.byteOffset ? equalArrayBuffer(first.buffer, second.buffer) : false;
}
function equalMap(first, second) {
  const { size } = first;
  if (size !== second.size) {
    return false;
  }
  const firstKeys = [...first.keys()];
  const secondKeys = [...second.keys()];
  if (firstKeys.some((key) => !secondKeys.includes(key))) {
    return false;
  }
  for (let index = 0;index < size; index += 1) {
    const key = firstKeys[index];
    if (!equal(first.get(key), second.get(key))) {
      return false;
    }
  }
  return true;
}
function equalObject(first, second) {
  const firstKeys = Object.keys(first);
  const secondKeys = Object.keys(second);
  const { length } = firstKeys;
  if (length !== secondKeys.length || firstKeys.some((key) => !secondKeys.includes(key))) {
    return false;
  }
  for (let index = 0;index < length; index += 1) {
    const key = firstKeys[index];
    if (!equal(first[key], second[key])) {
      return false;
    }
  }
  return true;
}
function equalProperties(first, second, properties) {
  const { length } = properties;
  for (let index = 0;index < length; index += 1) {
    const property = properties[index];
    if (!equal(first[property], second[property])) {
      return false;
    }
  }
  return true;
}
function equalSet(first, second) {
  const { size } = first;
  if (size !== second.size) {
    return false;
  }
  const firstValues = [...first];
  const secondValues = [...second];
  for (let index = 0;index < size; index += 1) {
    const firstValue = firstValues[index];
    if (!secondValues.some((secondValue) => equal(firstValue, secondValue))) {
      return false;
    }
  }
  return true;
}

// src/js/value/diff.ts
function diff(first, second) {
  const result = {
    original: {
      from: first,
      to: second
    },
    type: "partial",
    values: {}
  };
  const same = Object.is(first, second);
  const firstIsArrayOrObject = isArrayOrPlainObject(first);
  const secondIsArrayOrObject = isArrayOrPlainObject(second);
  if (same || !firstIsArrayOrObject && !secondIsArrayOrObject) {
    result.type = same ? "none" : "full";
    return result;
  }
  if (firstIsArrayOrObject !== secondIsArrayOrObject) {
    result.type = "full";
  }
  const diffs = getDiffs(first, second);
  const { length } = diffs;
  if (length === 0) {
    result.type = "none";
  }
  for (let index = 0;index < length; index += 1) {
    const diff2 = diffs[index];
    result.values[diff2.key] = { from: diff2.from, to: diff2.to };
  }
  return result;
}
function getDiffs(first, second, prefix) {
  const changes = [];
  const checked = new Set;
  for (let outerIndex = 0;outerIndex < 2; outerIndex += 1) {
    const value = outerIndex === 0 ? first : second;
    if (!value) {
      continue;
    }
    const keys = Object.keys(value);
    const { length } = keys;
    for (let innerIndex = 0;innerIndex < length; innerIndex += 1) {
      const key = keys[innerIndex];
      if (checked.has(key)) {
        continue;
      }
      const from = first?.[key];
      const to = second?.[key];
      if (!equal(from, to)) {
        const prefixed = join([prefix, key], ".");
        const change = {
          from,
          to,
          key: prefixed
        };
        const nested = isArrayOrPlainObject(from) || isArrayOrPlainObject(to);
        const diffs = nested ? getDiffs(from, to, prefixed) : [];
        if (!nested || nested && diffs.length > 0) {
          changes.push(change);
        }
        changes.push(...diffs);
      }
      checked.add(key);
    }
  }
  return changes;
}
// src/js/internal/value-handle.ts
function findKey(needle, haystack, ignoreCase) {
  if (!ignoreCase) {
    return needle;
  }
  const keys = Object.keys(haystack);
  const normalised = keys.map((key) => key.toLowerCase());
  const index = normalised.indexOf(needle.toLowerCase());
  return index > -1 ? keys[index] : needle;
}
function handleValue(data, path, value, get, ignoreCase) {
  if (typeof data === "object" && data !== null && !/^(__proto__|constructor|prototype)$/i.test(path)) {
    const key = findKey(path, data, ignoreCase);
    if (get) {
      return data[key];
    }
    data[key] = value;
  }
}

// src/js/value/get.ts
function getValue(data, path, ignoreCase) {
  const shouldIgnoreCase = ignoreCase === true;
  const parts = (shouldIgnoreCase ? path.toLowerCase() : path).split(".");
  const { length } = parts;
  let index = 0;
  let value = typeof data === "object" ? data ?? {} : {};
  while (index < length && value != null) {
    value = handleValue(value, parts[index++], null, true, shouldIgnoreCase);
  }
  return value;
}
// src/js/value/merge.ts
function merge(values, options) {
  if (values.length === 0) {
    return {};
  }
  const skipNullable = options?.skipNullable ?? false;
  const actual = values.filter((value) => isArrayOrPlainObject(value));
  const result = actual.every(Array.isArray) ? [] : {};
  const isArray = Array.isArray(result);
  const { length } = actual;
  for (let outerIndex = 0;outerIndex < length; outerIndex += 1) {
    const item = actual[outerIndex];
    const keys = Object.keys(item);
    const size = keys.length;
    for (let innerIndex = 0;innerIndex < size; innerIndex += 1) {
      const key = keys[innerIndex];
      const next = item[key];
      const previous = result[key];
      if (isArray && skipNullable && next == null) {
        continue;
      }
      if (isArrayOrPlainObject(next)) {
        result[key] = isArrayOrPlainObject(previous) ? merge([previous, next]) : merge([next]);
      } else {
        result[key] = next;
      }
    }
  }
  return result;
}
// src/js/value/set.ts
function setValue(data, path, value, ignoreCase) {
  const shouldIgnoreCase = ignoreCase === true;
  const parts = (shouldIgnoreCase ? path.toLowerCase() : path).split(".");
  const { length } = parts;
  const lastIndex = length - 1;
  let previous;
  let target = typeof data === "object" && data !== null ? data : {};
  for (let index = 0;index < length; index += 1) {
    const part = parts[index];
    if (index === lastIndex) {
      handleValue(target, part, value, false, shouldIgnoreCase);
      break;
    }
    let next = handleValue(target, part, null, true, shouldIgnoreCase);
    if (typeof next !== "object" || next === null) {
      next = {};
      target[part] = next;
    }
    previous = target;
    target = next;
  }
  return data;
}
// src/js/value/smush.ts
function flatten(value, prefix) {
  const keys = Object.keys(value);
  const { length } = keys;
  const smushed = {};
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    const val = value[key];
    if (isArrayOrPlainObject(val)) {
      Object.assign(smushed, {
        [join([prefix, key], ".")]: Array.isArray(val) ? [...val] : { ...val },
        ...flatten(val, join([prefix, key], "."))
      });
    } else {
      smushed[join([prefix, key], ".")] = val;
    }
  }
  return smushed;
}
function smush(value) {
  return flatten(value);
}
// src/js/value/unsmush.ts
function getKeyGroups(value) {
  const keys = Object.keys(value);
  const { length } = keys;
  const grouped = [];
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    const dots = key.split(".");
    if (grouped[dots.length] == null) {
      grouped[dots.length] = [key];
    } else {
      grouped[dots.length].push(key);
    }
  }
  return grouped;
}
function unsmush(value) {
  const groups = getKeyGroups(value);
  const { length } = groups;
  const unsmushed = {};
  for (let groupIndex = 1;groupIndex < length; groupIndex += 1) {
    const group = groups[groupIndex];
    const groupLength = group.length;
    for (let keyIndex = 0;keyIndex < groupLength; keyIndex += 1) {
      const key = group[keyIndex];
      const val = value[key];
      setValue(unsmushed, key, isArrayOrPlainObject(val) ? Array.isArray(val) ? [...val] : { ...val } : val);
    }
  }
  return unsmushed;
}
// src/js/string/template.ts
function template(value2, variables, options) {
  const ignoreCase = options?.ignoreCase === true;
  const pattern = options?.pattern instanceof RegExp ? options.pattern : /{{([\s\S]+?)}}/g;
  const values = {};
  return value2.replace(pattern, (_, key) => {
    if (values[key] != null) {
      return values[key];
    }
    const value3 = getValue(variables, key, ignoreCase);
    if (value3 == null) {
      return "";
    }
    values[key] = String(value3);
    return values[key];
  });
}
// src/js/is.ts
function isArrayOrPlainObject(value2) {
  return Array.isArray(value2) || isPlainObject(value2);
}
function isEmpty(value2) {
  const values = Object.values(value2);
  const { length } = values;
  let count2 = 0;
  for (let index = 0;index < length; index += 1) {
    if (values[index] != null) {
      count2 += 1;
    }
  }
  return count2 === 0;
}
function isKey(value2) {
  return typeof value2 === "number" || typeof value2 === "string";
}
function isNullable(value2) {
  return value2 == null;
}
function isNullableOrEmpty(value2) {
  return value2 == null || getString(value2) === "";
}
function isNullableOrWhitespace(value2) {
  return value2 == null || /^\s*$/.test(getString(value2));
}
function isNumber(value2) {
  return typeof value2 === "number" && !Number.isNaN(value2);
}
function isNumerical(value2) {
  return isNumber(value2) || typeof value2 === "string" && value2.trim().length > 0 && !Number.isNaN(+value2);
}
function isObject(value2) {
  return typeof value2 === "object" && value2 !== null || typeof value2 === "function";
}
function isPlainObject(value2) {
  if (typeof value2 !== "object" || value2 === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value2);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value2) && !(Symbol.iterator in value2);
}
function isPrimitive(value2) {
  return value2 == null || /^(bigint|boolean|number|string|symbol)$/.test(typeof value2);
}

// src/js/array/sort.ts
function comparison(first, second) {
  if (typeof first === "number" && typeof second === "number") {
    return first - second;
  }
  const firstAsNumber = Number(first);
  const secondAsNumber = Number(second);
  return Number.isNaN(firstAsNumber) || Number.isNaN(secondAsNumber) ? String(first).localeCompare(String(second)) : firstAsNumber - secondAsNumber;
}
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
      returned.callback = (value2) => value2[key];
    } else if (typeof key === "function") {
      returned.callback = key;
    } else if (typeof key?.value === "function" || isKey(key?.value)) {
      returned.direction = key?.direction ?? direction;
      returned.callback = typeof key.value === "function" ? key.value : (value2) => value2[key.value];
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
    const value2 = array2[index];
    const key = hasCallback ? callbacks?.key?.(value2, index, array2) ?? index : index;
    if (asArrays) {
      const existing = map.get(key);
      if (Array.isArray(existing)) {
        existing.push(value2);
      } else {
        map.set(key, [value2]);
      }
    } else {
      map.set(key, value2);
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
// src/js/colour/index.ts
function getForegroundColour(value2) {
  const values = [value2.blue / 255, value2.green / 255, value2.red / 255];
  for (let colour of values) {
    if (colour <= 0.03928) {
      colour /= 12.92;
    } else {
      colour = ((colour + 0.055) / 1.055) ** 2.4;
    }
  }
  const luminance = 0.2126 * values[2] + 0.7152 * values[1] + 0.0722 * values[0];
  return luminance > 0.625 ? "black" : "white";
}

// src/js/number.ts
function between(value2, min, max) {
  return value2 >= min && value2 <= max;
}
function clamp(value2, min, max, loop) {
  if (value2 < min) {
    return loop === true ? max : min;
  }
  return value2 > max ? loop === true ? min : max : value2;
}
function getNumber(value2) {
  if (typeof value2 === "number") {
    return value2;
  }
  if (typeof value2 === "symbol") {
    return Number.NaN;
  }
  let parsed = value2?.valueOf?.() ?? value2;
  if (typeof parsed === "object") {
    parsed = parsed?.toString() ?? parsed;
  }
  if (typeof parsed !== "string") {
    return parsed == null ? Number.NaN : typeof parsed === "number" ? parsed : +parsed;
  }
  if (/^\s*0+\s*$/.test(parsed)) {
    return 0;
  }
  const trimmed = parsed.trim();
  if (trimmed.length === 0) {
    return Number.NaN;
  }
  const isBinary = /^0b[01]+$/i.test(trimmed);
  if (isBinary || /^0o[0-7]+$/i.test(trimmed)) {
    return Number.parseInt(trimmed.slice(2), isBinary ? 2 : 8);
  }
  return +(/^0x[0-9a-f]+$/i.test(trimmed) ? trimmed : trimmed.replace(/_/g, ""));
}

// src/js/colour/is.ts
function isColour(value2) {
  return isInstance(/^(hex|hsl|rgb)$/, value2);
}
function isColourValue(value2, properties) {
  return typeof value2 === "object" && value2 !== null && properties.every((property) => (property in value2) && typeof value2[property] === "number");
}
function isHexColour(value2) {
  return isInstance(/^hex$/, value2);
}
function isHSLColour(value2) {
  return isInstance(/^hsl$/, value2);
}
function isInstance(pattern, value2) {
  return typeof value2 === "object" && value2 !== null && "$colour" in value2 && typeof value2.$colour === "string" && pattern.test(value2.$colour);
}
function isRGBColour(value2) {
  return isInstance(/^rgb$/, value2);
}

// src/js/colour/base.ts
class Colour {
  get value() {
    return { ...this.state.value };
  }
  constructor(type, value2, defaults, properties) {
    this.$colour = type;
    this.state = {
      value: isColourValue(value2, properties) ? { ...value2 } : { ...defaults }
    };
  }
}

// src/js/colour/hsl.ts
function getHSLColour(value2) {
  return new HSLColour(value2);
}

class HSLColour extends Colour {
  get hue() {
    return +this.state.value.hue;
  }
  set hue(value2) {
    this.state.value.hue = clamp(value2, 0, 360);
  }
  get lightness() {
    return +this.state.value.lightness;
  }
  set lightness(value2) {
    this.state.value.lightness = clamp(value2, 0, 100);
  }
  get saturation() {
    return +this.state.value.saturation;
  }
  set saturation(value2) {
    this.state.value.saturation = clamp(value2, 0, 100);
  }
  constructor(value2) {
    super("hsl", value2, defaults, properties);
  }
  toHex() {
    return HSLColour.toRgb(this.state.value).toHex();
  }
  toRgb() {
    return HSLColour.toRgb(this.state.value);
  }
  toString() {
    return `hsl(${this.state.value.hue}, ${this.state.value.saturation}%, ${this.state.value.lightness}%)`;
  }
  static toRgb(value2) {
    return hslToRgb(value2);
  }
}
var defaults = {
  hue: 0,
  lightness: 0,
  saturation: 0
};
var properties = [
  "hue",
  "lightness",
  "saturation"
];

// src/js/colour/rgb.ts
function getRGBColour(value2) {
  return new RGBColour(value2);
}

class RGBColour extends Colour {
  get blue() {
    return +this.state.value.blue;
  }
  set blue(value2) {
    this.state.value.blue = clamp(value2, 0, 255);
  }
  get green() {
    return +this.state.value.green;
  }
  set green(value2) {
    this.state.value.green = clamp(value2, 0, 255);
  }
  get red() {
    return +this.state.value.red;
  }
  set red(value2) {
    this.state.value.red = clamp(value2, 0, 255);
  }
  constructor(value2) {
    super("rgb", value2, defaults2, properties2);
  }
  toHex() {
    return RGBColour.toHex(this.value);
  }
  toHsl() {
    return RGBColour.toHsl(this.value);
  }
  toString() {
    return `rgb(${this.value.red}, ${this.value.green}, ${this.value.blue})`;
  }
  static toHex(value2) {
    return rgbToHex(value2);
  }
  static toHsl(rgb) {
    return rgbToHsl(rgb);
  }
}
var defaults2 = {
  blue: 0,
  green: 0,
  red: 0
};
var properties2 = ["blue", "green", "red"];

// src/js/colour/functions.ts
function getNormalisedHex(value2) {
  const normalised = value2.replace(/^#/, "");
  return normalised.length === 3 ? normalised.split("").map((character) => character.repeat(2)).join("") : normalised;
}
function hexToRgb(value2) {
  const hex2 = anyPattern.test(value2) ? getNormalisedHex(value2) : "";
  const pairs = groupedPattern.exec(hex2) ?? [];
  const rgb2 = [];
  const { length } = pairs;
  for (let index = 1;index < length; index += 1) {
    rgb2.push(Number.parseInt(pairs[index], 16));
  }
  return new RGBColour({
    blue: rgb2[2] ?? 0,
    green: rgb2[1] ?? 0,
    red: rgb2[0] ?? 0
  });
}
function hslToRgb(value2) {
  let hue = value2.hue % 360;
  if (hue < 0) {
    hue += 360;
  }
  const saturation = value2.saturation / 100;
  const lightness = value2.lightness / 100;
  function get2(value3) {
    const part = (value3 + hue / 30) % 12;
    const mod = saturation * Math.min(lightness, 1 - lightness);
    return lightness - mod * Math.max(-1, Math.min(part - 3, 9 - part, 1));
  }
  return new RGBColour({
    blue: clamp(Math.round(get2(4) * 255), 0, 255),
    green: clamp(Math.round(get2(8) * 255), 0, 255),
    red: clamp(Math.round(get2(0) * 255), 0, 255)
  });
}
function rgbToHex(value2) {
  return new HexColour(`${[value2.red, value2.green, value2.blue].map((colour) => {
    const hex2 = colour.toString(16);
    return hex2.length === 1 ? `0${hex2}` : hex2;
  }).join("")}`);
}
function rgbToHsl(rgb2) {
  const blue = rgb2.blue / 255;
  const green = rgb2.green / 255;
  const red = rgb2.red / 255;
  const max = Math.max(blue, green, red);
  const min = Math.min(blue, green, red);
  const delta = max - min;
  const lightness = (min + max) / 2;
  let hue = 0;
  let saturation = 0;
  if (delta !== 0) {
    saturation = lightness === 0 || lightness === 1 ? 0 : (max - lightness) / Math.min(lightness, 1 - lightness);
    switch (max) {
      case blue:
        hue = (red - green) / delta + 4;
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      default:
        break;
    }
    hue *= 60;
  }
  if (saturation < 0) {
    hue += 180;
    saturation = Math.abs(saturation);
  }
  if (hue >= 360) {
    hue -= 360;
  }
  return new HSLColour({
    hue: +hue.toFixed(2),
    lightness: +(lightness * 100).toFixed(2),
    saturation: +(saturation * 100).toFixed(2)
  });
}
var anyPattern = /^#*([a-f0-9]{3}){1,2}$/i;
var groupedPattern = /^#*([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;

// src/js/colour/hex.ts
function getHexColour(value2) {
  return new HexColour(value2);
}

class HexColour {
  state;
  get value() {
    return `#${this.state.value}`;
  }
  set value(value2) {
    this.state.value = anyPattern.test(value2) ? getNormalisedHex(value2) : "000000";
  }
  constructor(value2) {
    this.$colour = "hex";
    this.state = {
      value: typeof value2 === "string" && anyPattern.test(value2) ? getNormalisedHex(value2) : "000000"
    };
  }
  toHsl() {
    return HexColour.toRgb(this.value).toHsl();
  }
  toRgb() {
    return HexColour.toRgb(this.value);
  }
  toString() {
    return this.value;
  }
  static toRgb(value2) {
    return hexToRgb(value2);
  }
}
// src/js/function.ts
function debounce(callback, time) {
  const interval = clamp(time ?? 0, 0, 1000);
  let timer;
  const debounced = (...parameters) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback(...parameters);
    }, interval);
  };
  debounced.cancel = () => {
    clearTimeout(timer);
  };
  return debounced;
}
function memoise(callback) {
  return new Memoised(callback);
}
function noop() {
}
function throttle(callback, time) {
  const interval = clamp(time ?? 0, 0, 1000);
  let timestamp = performance.now();
  let timer;
  return (...parameters) => {
    clearTimeout(timer);
    const now = performance.now();
    const difference = now - timestamp;
    if (difference >= interval) {
      timestamp = now;
      callback(...parameters);
    } else {
      timer = setTimeout(() => {
        timestamp = performance.now();
        callback(...parameters);
      }, difference + interval);
    }
  };
}

class Memoised {
  constructor(callback) {
    const cache = new Map;
    const getter = (...parameters) => {
      const key = parameters[0];
      if (cache.has(key)) {
        return cache.get(key);
      }
      const value2 = callback(...parameters);
      cache.set(key, value2);
      return value2;
    };
    this.state = { cache, getter };
  }
  clear() {
    this.state.cache.clear();
  }
  delete(key) {
    return this.state.cache.delete(key);
  }
  get(key) {
    return this.state.cache.get(key);
  }
  has(key) {
    return this.state.cache.has(key);
  }
  run(...parameters) {
    return this.state.getter(...parameters);
  }
}

// src/js/emitter.ts
function getObserver(first, second, third) {
  let observer = {
    next: noop
  };
  if (typeof first === "object") {
    observer = first !== null && properties3.every((property) => {
      const value2 = first[property];
      return value2 == null || typeof value2 === "function";
    }) ? first : observer;
  } else if (typeof first === "function") {
    observer = {
      error: typeof second === "function" ? second : noop,
      next: first,
      complete: typeof third === "function" ? third : undefined
    };
  }
  return observer;
}
function emitter(value2) {
  return new Emitter(value2);
}
function finishEmitter(state, emit) {
  if (state.active) {
    state.active = false;
    for (const [subscription, observer] of state.observers) {
      if (emit) {
        observer.complete?.();
      }
      subscription.unsubscribe();
    }
  }
}

class Emitter {
  get active() {
    return this.state.active;
  }
  get observable() {
    return this.state.observable;
  }
  get value() {
    return this.state.value;
  }
  constructor(value2) {
    const observers = new Map;
    this.state = {
      observers,
      value: value2,
      active: true,
      observable: new Observable(this, observers)
    };
  }
  destroy() {
    finishEmitter(this.state, false);
  }
  emit(value2, finish) {
    if (this.state.active) {
      this.state.value = value2;
      for (const [, observer] of this.state.observers) {
        observer.next?.(value2);
      }
      if (finish === true) {
        finishEmitter(this.state, true);
      }
    }
  }
  error(error, finish) {
    if (this.state.active) {
      for (const [, observer] of this.state.observers) {
        observer.error?.(error);
      }
      if (finish === true) {
        finishEmitter(this.state, true);
      }
    }
  }
  finish() {
    finishEmitter(this.state, true);
  }
}

class Observable {
  constructor(emitter2, observers) {
    this.state = {
      emitter: emitter2,
      observers
    };
  }
  subscribe(first, second, third) {
    const observer = getObserver(first, second, third);
    const instance = new Subscription(this.state);
    this.state.observers.set(instance, observer);
    observer.next?.(this.state.emitter.value);
    return instance;
  }
}

class Subscription {
  constructor(state) {
    this.state = {
      ...state,
      closed: false
    };
  }
  get closed() {
    return this.state.closed || !this.state.emitter.active;
  }
  unsubscribe() {
    if (!this.state.closed) {
      this.state.closed = true;
      this.state.observers.delete(this);
    }
  }
}
var properties3 = ["complete", "error", "next"];
// src/js/event.ts
function getPosition(event) {
  let x;
  let y;
  if (event instanceof MouseEvent) {
    x = event.clientX;
    y = event.clientY;
  } else if (event instanceof TouchEvent) {
    x = event.touches[0]?.clientX;
    y = event.touches[0]?.clientY;
  }
  return typeof x === "number" && typeof y === "number" ? { x, y } : undefined;
}
// src/js/logger.ts
if (globalThis._atomic_logging == null) {
  globalThis._atomic_logging = true;
}

class Logger {
  get debug() {
    return this.enabled ? console.debug : noop;
  }
  get dir() {
    return this.enabled ? console.dir : noop;
  }
  get enabled() {
    return globalThis._atomic_logging ?? true;
  }
  set enabled(value2) {
    globalThis._atomic_logging = value2;
  }
  get error() {
    return this.enabled ? console.error : noop;
  }
  get info() {
    return this.enabled ? console.info : noop;
  }
  get log() {
    return this.enabled ? console.log : noop;
  }
  get table() {
    return this.enabled ? console.table : noop;
  }
  get trace() {
    return this.enabled ? console.trace : noop;
  }
  get warn() {
    return this.enabled ? console.warn : noop;
  }
  time(label) {
    return new Time(label);
  }
}

class Time {
  constructor(label) {
    this.state = {
      label,
      started: globalThis._atomic_logging ?? true,
      stopped: false
    };
    if (this.state.started) {
      console.time(label);
    }
  }
  log() {
    if (this.state.started && !this.state.stopped && logger.enabled) {
      console.timeLog(this.state.label);
    }
  }
  stop() {
    if (this.state.started && !this.state.stopped) {
      this.state.stopped = true;
      console.timeEnd(this.state.label);
    }
  }
}
var logger = new Logger;
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
function round(value2, decimals) {
  if (typeof decimals !== "number" || decimals < 1) {
    return Math.round(value2);
  }
  const mod = 10 ** decimals;
  return Math.round((value2 + Number.EPSILON) * mod) / mod;
}
function sum(values) {
  return values.reduce((previous, current) => previous + current, 0);
}
// src/js/query.ts
function fromQuery(query) {
  const parts = query.split("&");
  const { length } = parts;
  const parameters = {};
  for (let outer = 0;outer < length; outer += 1) {
    const [key, value3] = parts[outer].split("=").map(decodeURIComponent);
    if (isNullableOrWhitespace(key)) {
      continue;
    }
    if (key.includes(".")) {
      setValue(parameters, key, getValue2(value3));
    } else {
      if (key in parameters) {
        if (!Array.isArray(parameters[key])) {
          parameters[key] = [parameters[key]];
        }
        parameters[key].push(getValue2(value3));
      } else {
        parameters[key] = getValue2(value3);
      }
    }
  }
  return parameters;
}
function getParts(value3, fromArray, prefix) {
  const keys = Object.keys(value3);
  const { length } = keys;
  const parts = [];
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    const val = value3[key];
    if (Array.isArray(val)) {
      parts.push(...getParts(val, true, join([prefix, fromArray ? null : key], ".")));
    } else if (isPlainObject(val)) {
      parts.push(...getParts(val, false, join([prefix, key], ".")));
    } else if (isDecodable(val)) {
      parts.push(`${encodeURIComponent(join([prefix, fromArray ? null : key], "."))}=${encodeURIComponent(val)}`);
    }
  }
  return parts;
}
function getValue2(value3) {
  if (/^(false|true)$/.test(value3)) {
    return value3 === "true";
  }
  const asNumber = Number(value3);
  if (!Number.isNaN(asNumber)) {
    return asNumber;
  }
  return value3;
}
function isDecodable(value3) {
  return ["boolean", "number", "string"].includes(typeof value3);
}
function toQuery(parameters) {
  return getParts(parameters, false).filter((part) => part.length > 0).join("&");
}
// src/js/queue.ts
function queue(callback) {
  _atomic_queued.add(callback);
  if (_atomic_queued.size > 0) {
    queueMicrotask(() => {
      const callbacks = [..._atomic_queued];
      const { length } = callbacks;
      _atomic_queued.clear();
      for (let index = 0;index < length; index += 1) {
        callbacks[index]();
      }
    });
  }
}
if (globalThis._atomic_queued == null) {
  const queued = new Set;
  Object.defineProperty(globalThis, "_atomic_queued", {
    get() {
      return queued;
    }
  });
}
// src/js/touch.ts
var supportsTouch = (() => {
  let value3 = false;
  try {
    if ("matchMedia" in window) {
      const media = matchMedia("(pointer: coarse)");
      if (typeof media?.matches === "boolean") {
        value3 = media.matches;
      }
    }
    if (!value3) {
      value3 = "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator.msMaxTouchPoints ?? 0) > 0;
    }
  } catch {
    value3 = false;
  }
  return value3;
})();
export {
  words,
  unsmush,
  unique,
  truncate,
  toRecord,
  toQuery,
  toMap,
  titleCase,
  throttle,
  template,
  sum,
  splice,
  sort,
  snakeCase,
  smush,
  shuffle2 as shuffle,
  setValue,
  round,
  queue,
  push,
  pascalCase,
  partial,
  parse,
  noop,
  min,
  merge,
  memoise,
  max,
  logger,
  kebabCase,
  join,
  isRGBColour,
  isPrimitive,
  isPlainObject,
  isObject,
  isNumerical,
  isNumber,
  isNullableOrWhitespace,
  isNullableOrEmpty,
  isNullable,
  isKey,
  isHexColour,
  isHSLColour,
  isEmpty,
  isColour,
  isArrayOrPlainObject,
  insert,
  indexOf,
  groupBy,
  getValue,
  getString,
  getRandomItems,
  getRandomItem,
  getRandomInteger,
  getRandomHex,
  getRandomFloat,
  getRandomDate,
  getRandomColour,
  getRandomCharacters,
  getRandomBoolean,
  getRGBColour,
  getPosition,
  getNumber,
  getHexColour,
  getHSLColour,
  getForegroundColour,
  fromQuery,
  flatten2 as flatten,
  find,
  filter,
  exists,
  equal,
  emitter,
  diff,
  debounce,
  createUuid,
  count,
  compact,
  clone,
  clamp,
  chunk,
  capitalise,
  camelCase,
  between,
  average,
  RGBColour,
  HexColour,
  HSLColour
};
