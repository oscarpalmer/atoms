// src/js/array/chunk.ts
function chunk(array, size) {
  const { length } = array;
  const chunkSize = typeof size === "number" && size > 0 ? size : 64000;
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
function flatten2(array) {
  return array.flat(Number.POSITIVE_INFINITY);
}
function push(array, values) {
  return insertValues("push", array, values, array.length, 0);
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
  const actual = typeof selection === "string" && selection.length > 0 ? selection : "abcdefghijklmnopqrstuvwxyz";
  let characters = "";
  for (let index = 0;index < length; index += 1) {
    characters += actual.charAt(getRandomInteger(0, actual.length));
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
  return amount == null || amount >= array.length ? shuffle(array) : shuffle(array).slice(0, amount);
}

// src/js/array/shuffle.ts
function shuffle(array) {
  const shuffled = array.slice();
  const { length } = shuffled;
  for (let index = 0;index < length; index += 1) {
    const random = getRandomInteger(0, length);
    [shuffled[index], shuffled[random]] = [shuffled[random], shuffled[index]];
  }
  return shuffled;
}
// src/js/string/index.ts
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
function join(value, delimiter) {
  return compact(value).map(getString).filter((value2) => value2.trim().length > 0).join(typeof delimiter === "string" ? delimiter : "");
}
function parse(value, reviver) {
  try {
    return JSON.parse(value, reviver);
  } catch {
  }
}
function truncate(value, length, suffix) {
  const suffixLength = suffix?.length ?? 0;
  const truncatedLength = length - suffixLength;
  return value.length <= length ? value : `${value.slice(0, truncatedLength)}${suffix ?? ""}`;
}
function words(value) {
  return value.match(/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g) ?? [];
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
function round(value, decimals) {
  if (typeof decimals !== "number" || decimals < 1) {
    return Math.round(value);
  }
  const mod = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * mod) / mod;
}
function sum(values) {
  return values.reduce((previous, current) => previous + current, 0);
}

// src/js/number.ts
function between(value, min2, max2) {
  return value >= min2 && value <= max2;
}
function clamp(value, min2, max2, loop) {
  if (value < min2) {
    return loop === true ? max2 : min2;
  }
  return value > max2 ? loop === true ? min2 : max2 : value;
}
function getNumber(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "symbol") {
    return Number.NaN;
  }
  let parsed = value?.valueOf?.() ?? value;
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

// src/js/value/compare.ts
function compare(first, second) {
  const firstParts = getParts(first);
  const secondParts = getParts(second);
  const length = max([firstParts.length, secondParts.length]);
  const lastIndex = length - 1;
  for (let index = 0;index < length; index += 1) {
    const firstPart = firstParts[index];
    const secondPart = secondParts[index];
    if (firstPart === secondPart) {
      if (index === lastIndex) {
        return 0;
      }
      continue;
    }
    if (firstPart == null || typeof firstPart === "string" && firstPart.length === 0) {
      return -1;
    }
    if (secondPart == null || typeof secondPart === "string" && secondPart.length === 0) {
      return 1;
    }
    const firstNumber = getNumber(firstPart);
    const secondNumber = getNumber(secondPart);
    const firstIsNaN = Number.isNaN(firstNumber);
    const secondIsNaN = Number.isNaN(secondNumber);
    if (firstIsNaN || secondIsNaN) {
      if (firstIsNaN && secondIsNaN) {
        return getString(firstPart).localeCompare(getString(secondPart));
      }
      if (firstIsNaN) {
        return 1;
      }
      if (secondIsNaN) {
        return -1;
      }
    }
    if (firstNumber === secondNumber) {
      if (index === lastIndex) {
        return 0;
      }
      continue;
    }
    return firstNumber - secondNumber;
  }
  return join(firstParts).localeCompare(join(secondParts));
}
function getParts(value) {
  if (value == null) {
    return [""];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return typeof value === "object" ? [value] : words(getString(value));
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
function template(value, variables, options) {
  const ignoreCase = options?.ignoreCase === true;
  const pattern = options?.pattern instanceof RegExp ? options.pattern : /{{([\s\S]+?)}}/g;
  const values = {};
  return value.replace(pattern, (_, key) => {
    if (values[key] != null) {
      return values[key];
    }
    const value2 = getValue(variables, key, ignoreCase);
    if (value2 == null) {
      return "";
    }
    values[key] = getString(value2);
    return values[key];
  });
}
// src/js/is.ts
function isArrayOrPlainObject(value) {
  return Array.isArray(value) || isPlainObject(value);
}
function isEmpty(value) {
  const values = Object.values(value);
  const { length } = values;
  let count2 = 0;
  for (let index = 0;index < length; index += 1) {
    if (values[index] != null) {
      count2 += 1;
    }
  }
  return count2 === 0;
}
function isKey(value) {
  return typeof value === "number" || typeof value === "string";
}
function isNullable(value) {
  return value == null;
}
function isNullableOrEmpty(value) {
  return value == null || getString(value) === "";
}
function isNullableOrWhitespace(value) {
  return value == null || /^\s*$/.test(getString(value));
}
function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}
function isNumerical(value) {
  return isNumber(value) || typeof value === "string" && value.trim().length > 0 && !Number.isNaN(+value);
}
function isObject(value) {
  return typeof value === "object" && value !== null || typeof value === "function";
}
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}
function isPrimitive(value) {
  return value == null || /^(bigint|boolean|number|string|symbol)$/.test(typeof value);
}

// src/js/array/sort.ts
function sort(array, first, second) {
  if (array.length < 2) {
    return array;
  }
  if (first == null || typeof first === "boolean") {
    return first === true ? array.sort((first2, second2) => second2 - first2) : array.sort();
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
    return direction === "asc" ? array.sort() : array.sort((first2, second2) => second2 - first2);
  }
  if (length === 1) {
    return array.sort((first2, second2) => compare(keys[0].callback(first2), keys[0].callback(second2)) * (keys[0].direction === "asc" ? 1 : -1));
  }
  const sorted = array.sort((first2, second2) => {
    for (let index = 0;index < length; index += 1) {
      const { callback, direction: direction2 } = keys[index];
      const descending = direction2 === "desc";
      const compared = compare(callback(descending ? second2 : first2), callback(descending ? first2 : second2));
      if (compared !== 0) {
        return compared;
      }
    }
    return 0;
  });
  return sorted;
}
// src/js/array/splice.ts
function splice(array, start, amountOrValues, values) {
  const amoutOrValuesIsArray = Array.isArray(amountOrValues);
  return insertValues("splice", array, amoutOrValuesIsArray ? amountOrValues : values ?? [], start, amoutOrValuesIsArray ? array.length : typeof amountOrValues === "number" && amountOrValues > 0 ? amountOrValues : 0);
}
// src/js/array/to-map.ts
function toMap(array, first, second) {
  const asArrays = first === true || second === true;
  const callbacks = getCallbacks(undefined, first);
  const hasCallback = typeof callbacks?.key === "function";
  const map = new Map;
  const { length } = array;
  for (let index = 0;index < length; index += 1) {
    const value = array[index];
    const key = hasCallback ? callbacks?.key?.(value, index, array) ?? index : index;
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
function toRecord(array, first, second) {
  return groupValues(array, first, first === true || second === true, true);
}
// src/js/array/unique.ts
function unique(array, key) {
  return findValues("unique", array, undefined, key);
}
// src/js/colour/index.ts
function getForegroundColour(value) {
  const values = [value.blue / 255, value.green / 255, value.red / 255];
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

// src/js/colour/is.ts
function isColour(value) {
  return isInstance(/^(hex|hsl|rgb)$/, value);
}
function isColourValue(value, properties) {
  return typeof value === "object" && value !== null && properties.every((property) => (property in value) && typeof value[property] === "number");
}
function isHexColour(value) {
  return isInstance(/^hex$/, value);
}
function isHSLColour(value) {
  return isInstance(/^hsl$/, value);
}
function isInstance(pattern, value) {
  return typeof value === "object" && value !== null && "$colour" in value && typeof value.$colour === "string" && pattern.test(value.$colour);
}
function isRGBColour(value) {
  return isInstance(/^rgb$/, value);
}

// src/js/colour/base.ts
class Colour {
  get value() {
    return { ...this.state.value };
  }
  constructor(type, value, defaults, properties) {
    this.$colour = type;
    this.state = {
      value: isColourValue(value, properties) ? { ...value } : { ...defaults }
    };
  }
}

// src/js/colour/hsl.ts
function getHSLColour(value) {
  return new HSLColour(value);
}

class HSLColour extends Colour {
  get hue() {
    return +this.state.value.hue;
  }
  set hue(value) {
    this.state.value.hue = clamp(value, 0, 360);
  }
  get lightness() {
    return +this.state.value.lightness;
  }
  set lightness(value) {
    this.state.value.lightness = clamp(value, 0, 100);
  }
  get saturation() {
    return +this.state.value.saturation;
  }
  set saturation(value) {
    this.state.value.saturation = clamp(value, 0, 100);
  }
  constructor(value) {
    super("hsl", value, defaults, properties);
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
  static toRgb(value) {
    return hslToRgb(value);
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
function getRGBColour(value) {
  return new RGBColour(value);
}

class RGBColour extends Colour {
  get blue() {
    return +this.state.value.blue;
  }
  set blue(value) {
    this.state.value.blue = clamp(value, 0, 255);
  }
  get green() {
    return +this.state.value.green;
  }
  set green(value) {
    this.state.value.green = clamp(value, 0, 255);
  }
  get red() {
    return +this.state.value.red;
  }
  set red(value) {
    this.state.value.red = clamp(value, 0, 255);
  }
  constructor(value) {
    super("rgb", value, defaults2, properties2);
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
  static toHex(value) {
    return rgbToHex(value);
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
function getNormalisedHex(value) {
  const normalised = value.replace(/^#/, "");
  return normalised.length === 3 ? normalised.split("").map((character) => character.repeat(2)).join("") : normalised;
}
function hexToRgb(value) {
  const hex = anyPattern.test(value) ? getNormalisedHex(value) : "";
  const pairs = groupedPattern.exec(hex) ?? [];
  const rgb = [];
  const { length } = pairs;
  for (let index = 1;index < length; index += 1) {
    rgb.push(Number.parseInt(pairs[index], 16));
  }
  return new RGBColour({
    blue: rgb[2] ?? 0,
    green: rgb[1] ?? 0,
    red: rgb[0] ?? 0
  });
}
function hslToRgb(value) {
  let hue = value.hue % 360;
  if (hue < 0) {
    hue += 360;
  }
  const saturation = value.saturation / 100;
  const lightness = value.lightness / 100;
  function get2(value2) {
    const part = (value2 + hue / 30) % 12;
    const mod = saturation * Math.min(lightness, 1 - lightness);
    return lightness - mod * Math.max(-1, Math.min(part - 3, 9 - part, 1));
  }
  return new RGBColour({
    blue: clamp(Math.round(get2(4) * 255), 0, 255),
    green: clamp(Math.round(get2(8) * 255), 0, 255),
    red: clamp(Math.round(get2(0) * 255), 0, 255)
  });
}
function rgbToHex(value) {
  return new HexColour(`${[value.red, value.green, value.blue].map((colour) => {
    const hex = colour.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }).join("")}`);
}
function rgbToHsl(rgb) {
  const blue = rgb.blue / 255;
  const green = rgb.green / 255;
  const red = rgb.red / 255;
  const max2 = Math.max(blue, green, red);
  const min2 = Math.min(blue, green, red);
  const delta = max2 - min2;
  const lightness = (min2 + max2) / 2;
  let hue = 0;
  let saturation = 0;
  if (delta !== 0) {
    saturation = lightness === 0 || lightness === 1 ? 0 : (max2 - lightness) / Math.min(lightness, 1 - lightness);
    switch (max2) {
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
function getHexColour(value) {
  return new HexColour(value);
}

class HexColour {
  state;
  get value() {
    return `#${this.state.value}`;
  }
  set value(value) {
    this.state.value = anyPattern.test(value) ? getNormalisedHex(value) : "000000";
  }
  constructor(value) {
    this.$colour = "hex";
    this.state = {
      value: typeof value === "string" && anyPattern.test(value) ? getNormalisedHex(value) : "000000"
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
  static toRgb(value) {
    return hexToRgb(value);
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
      const value = callback(...parameters);
      cache.set(key, value);
      return value;
    };
    this.state = { cache, getter };
  }
  clear() {
    this.state.cache?.clear();
  }
  delete(key) {
    return this.state.cache?.delete(key);
  }
  destroy() {
    this.state.cache.clear();
    this.state.cache = undefined;
    this.state.getter = noop;
  }
  get(key) {
    return this.state.cache?.get(key);
  }
  has(key) {
    return this.state.cache?.has(key) ?? false;
  }
  run(...parameters) {
    return this.state.getter(...parameters);
  }
}

// src/js/emitter.ts
function emitter(value) {
  return new Emitter(value);
}
function finishEmitter(state, emit) {
  if (state.active) {
    state.active = false;
    const entries = [...state.observers.entries()];
    const { length } = entries;
    for (let index = 0;index < length; index += 1) {
      const [subscription, observer] = entries[index];
      if (emit) {
        observer.complete?.();
      }
      subscription.destroy();
    }
    state.observers.clear();
    state.observable = undefined;
    state.observers = undefined;
    state.value = undefined;
  }
}
function getObserver(first, second, third) {
  let observer = {
    next: noop
  };
  if (typeof first === "object") {
    observer = first !== null && properties3.every((property) => {
      const value = first[property];
      return value == null || typeof value === "function";
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
  constructor(value) {
    const observers = new Map;
    this.state = {
      observers,
      value,
      active: true,
      observable: new Observable(this, observers)
    };
  }
  destroy() {
    finishEmitter(this.state, false);
  }
  emit(value, finish) {
    if (this.state.active) {
      this.state.value = value;
      for (const [, observer] of this.state.observers) {
        observer.next?.(value);
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
    return this.state.closed || !(this.state.emitter?.active ?? false);
  }
  destroy() {
    this.unsubscribe();
    this.state.emitter = undefined;
    this.state.observers = undefined;
  }
  unsubscribe() {
    if (!this.state.closed) {
      this.state.closed = true;
      this.state.observers?.delete(this);
    }
  }
}
var properties3 = ["complete", "error", "next"];
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
  set enabled(value) {
    globalThis._atomic_logging = value;
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
// src/js/query.ts
function fromQuery(query) {
  const parts = query.split("&");
  const { length } = parts;
  const parameters = {};
  for (let index = 0;index < length; index += 1) {
    const [key, value] = parts[index].split("=").map(decodeURIComponent);
    if (isNullableOrWhitespace(key)) {
      continue;
    }
    if (key.includes(".")) {
      setValue(parameters, key, getValue2(value));
    } else {
      if (key in parameters) {
        if (!Array.isArray(parameters[key])) {
          parameters[key] = [parameters[key]];
        }
        parameters[key].push(getValue2(value));
      } else {
        parameters[key] = getValue2(value);
      }
    }
  }
  return parameters;
}
function getParts2(value, fromArray, prefix) {
  const keys = Object.keys(value);
  const { length } = keys;
  const parts = [];
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    const val = value[key];
    if (Array.isArray(val)) {
      parts.push(...getParts2(val, true, join([prefix, fromArray ? null : key], ".")));
    } else if (isPlainObject(val)) {
      parts.push(...getParts2(val, false, join([prefix, key], ".")));
    } else if (isDecodable(val)) {
      parts.push(`${encodeURIComponent(join([prefix, fromArray ? null : key], "."))}=${encodeURIComponent(val)}`);
    }
  }
  return parts;
}
function getValue2(value) {
  if (/^(false|true)$/.test(value)) {
    return value === "true";
  }
  const asNumber = Number(value);
  if (!Number.isNaN(asNumber)) {
    return asNumber;
  }
  return value;
}
function isDecodable(value) {
  return ["boolean", "number", "string"].includes(typeof value);
}
function toQuery(parameters) {
  return getParts2(parameters, false).filter((part) => part.length > 0).join("&");
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
// src/js/sized.ts
function getMaximum(first, second) {
  const actual = (typeof first === "number" ? first : typeof second === "number" ? second : undefined) ?? 2 ** 20;
  return clamp(actual, 1, 2 ** 24);
}

class SizedMap extends Map {
  maximumSize;
  get full() {
    return this.size >= this.maximumSize;
  }
  get maximum() {
    return this.maximumSize;
  }
  constructor(entries, maximum) {
    const maximumSize = getMaximum(typeof entries === "number" ? entries : typeof maximum === "number" ? maximum : undefined);
    super(Array.isArray(entries) ? entries.slice(0, maximumSize) : undefined);
    this.maximumSize = maximumSize;
    if (Array.isArray(entries) && entries.length > maximumSize) {
      for (let index = 0;index < maximumSize; index += 1) {
        this.set(...entries[entries.length - maximumSize + index]);
      }
    }
  }
  get(key) {
    const value = super.get(key);
    if (value === undefined && !this.has(key)) {
      return;
    }
    this.set(key, value);
    return value;
  }
  set(key, value) {
    if (this.has(key)) {
      this.delete(key);
    } else if (this.size >= this.maximumSize) {
      this.delete(this.keys().next().value);
    }
    return super.set(key, value);
  }
}

class SizedSet extends Set {
  maximumSize;
  get full() {
    return this.size >= this.maximumSize;
  }
  get maximum() {
    return this.maximumSize;
  }
  constructor(values, maximum) {
    const maximumSize = getMaximum(typeof values === "number" ? values : typeof maximum === "number" ? maximum : undefined);
    super(Array.isArray(values) && values.length <= maximumSize ? values : undefined);
    this.maximumSize = maximumSize;
    if (Array.isArray(values) && values.length > maximumSize) {
      for (let index = 0;index < maximumSize; index += 1) {
        this.add(values[values.length - maximumSize + index]);
      }
    }
  }
  add(value) {
    if (this.has(value)) {
      this.delete(value);
    } else if (this.size >= this.maximumSize) {
      this.delete(this.values().next().value);
    }
    return super.add(value);
  }
  at(index, update) {
    const value = [...this.values()][index < 0 ? this.size + index : index];
    if ((update ?? false) && this.has(value)) {
      this.delete(value);
      this.add(value);
    }
    return value;
  }
  get(value, update) {
    if (this.has(value)) {
      if (update ?? false) {
        this.delete(value);
        this.add(value);
      }
      return value;
    }
  }
}
// src/js/touch.ts
var supportsTouch = (() => {
  let value = false;
  try {
    if ("matchMedia" in window) {
      const media = matchMedia("(pointer: coarse)");
      if (typeof media?.matches === "boolean") {
        value = media.matches;
      }
    }
    if (!value) {
      value = "ontouchstart" in window || navigator.maxTouchPoints > 0 || (navigator.msMaxTouchPoints ?? 0) > 0;
    }
  } catch {
    value = false;
  }
  return value;
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
  shuffle,
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
  compare,
  compact,
  clone,
  clamp,
  chunk,
  capitalise,
  camelCase,
  between,
  average,
  SizedSet,
  SizedMap,
  RGBColour,
  HexColour,
  HSLColour
};
