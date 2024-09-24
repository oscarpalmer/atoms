// src/js/array/compact.ts
function compact(array, strict) {
  return strict === true ? array.filter((item) => !!item) : array.filter((item) => item != null);
}
// src/js/string/index.ts
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
// src/js/is.ts
function isNullableOrWhitespace(value) {
  return value == null || /^\s*$/.test(getString(value));
}
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
}

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
function getParts(value, fromArray, prefix) {
  const keys = Object.keys(value);
  const { length } = keys;
  const parts = [];
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    const val = value[key];
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
  return getParts(parameters, false).filter((part) => part.length > 0).join("&");
}
export {
  toQuery,
  fromQuery
};
