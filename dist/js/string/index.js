// src/js/array/compact.ts
function compact(array, strict) {
  return strict === true ? array.filter((item) => !!item) : array.filter((item) => item != null);
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
export {
  words,
  truncate,
  titleCase,
  template,
  snakeCase,
  pascalCase,
  parse,
  kebabCase,
  join,
  getString,
  createUuid,
  capitalise,
  camelCase
};
