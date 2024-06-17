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
    const index = array.findIndex(callbacks.bool);
    return type === "index" ? index : index > -1 ? array[index] : undefined;
  }
  const { length } = array;
  for (let index = 0;index < length; index += 1) {
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
  for (let index = 0;index < length; index += 1) {
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
  for (let index = 0;index < length; index += 1) {
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
  let returned;
  for (let index = 0;index < length; index += 1) {
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
// src/js/string.ts
function camelCase(value) {
  return toCase(value, "", true, false);
}
function capitalise(value) {
  if (value.length === 0) {
    return value;
  }
  return value.length === 1 ? value.toLocaleUpperCase() : `${value.charAt(0).toLocaleUpperCase()}${value.slice(1).toLocaleLowerCase()}`;
}
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
  return value.filter((item) => !isNullableOrWhitespace(item)).map(getString).join(typeof delimiter === "string" ? delimiter : "");
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
var toCase = function(value, delimiter, capitaliseAny, capitaliseFirst) {
  return words(value).map((word, index) => {
    const parts = word.replace(/(\p{Lu}*)(\p{Lu})(\p{Ll}+)/gu, (full, one, two, three) => three === "s" ? full : `${one}-${two}${three}`).replace(/(\p{Ll})(\p{Lu})/gu, "$1-$2").split("-");
    return parts.filter((part) => part.length > 0).map((part, partIndex) => !capitaliseAny || partIndex === 0 && index === 0 && !capitaliseFirst ? part.toLocaleLowerCase() : capitalise(part)).join(delimiter);
  }).join(delimiter);
};
function truncate(value, length, suffix) {
  const suffixLength = suffix?.length ?? 0;
  const truncatedLength = length - suffixLength;
  return value.length <= length ? value : `${value.slice(0, truncatedLength)}${suffix ?? ""}`;
}
function words(value) {
  return value.match(/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g) ?? [];
}

// src/js/is.ts
function isArrayOrPlainObject(value) {
  return Array.isArray(value) || isPlainObject(value);
}
function isEmpty(value) {
  if (Array.isArray(value)) {
    return value.length === 0 || value.filter((item) => item != null).length === 0;
  }
  const values = Object.values(value);
  return values.length === 0 || values.filter((item) => item != null).length === 0;
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

// src/js/clone.ts
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
    case value instanceof Node:
      return value.cloneNode(true);
    case value instanceof RegExp:
      return cloneRegularExpression(value);
    case isArrayOrPlainObject(value):
      return cloneNested(value);
    default:
      return structuredClone(value);
  }
}
var cloneArrayBuffer = function(value) {
  const cloned = new ArrayBuffer(value.byteLength);
  new Uint8Array(cloned).set(new Uint8Array(value));
  return cloned;
};
var cloneDataView = function(value) {
  const buffer = cloneArrayBuffer(value.buffer);
  return new DataView(buffer, value.byteOffset, value.byteLength);
};
var cloneNested = function(value) {
  const cloned = Array.isArray(value) ? [] : {};
  const keys = Object.keys(value);
  const { length } = keys;
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    cloned[key] = clone(value[key]);
  }
  return cloned;
};
var cloneRegularExpression = function(value) {
  const cloned = new RegExp(value.source, value.flags);
  cloned.lastIndex = value.lastIndex;
  return cloned;
};
// src/js/number.ts
function between(value, min, max) {
  return value >= min && value <= max;
}
function clamp(value, min, max, loop) {
  if (value < min) {
    return loop === true ? max : min;
  }
  return value > max ? loop === true ? min : max : value;
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

// src/js/colour.ts
var createHex = function(original) {
  let value = original.slice();
  const instance = Object.create({
    toHsl() {
      return hexToRgb(value).toHsl();
    },
    toRgb() {
      return hexToRgb(value);
    },
    toString() {
      return `#${value}`;
    }
  });
  Object.defineProperty(instance, "value", {
    get() {
      return `#${value}`;
    },
    set(hex) {
      if (anyPattern.test(hex)) {
        value = getNormalisedHex(hex);
      }
    }
  });
  return instance;
};
var createHsl = function(original) {
  const value = { ...original };
  const instance = Object.create({
    toHex() {
      return hslToRgb(value).toHex();
    },
    toRgb() {
      return hslToRgb(value);
    },
    toString() {
      return `hsl(${value.hue}, ${value.saturation}%, ${value.lightness}%)`;
    }
  });
  Object.defineProperties(instance, {
    hue: createProperty(value, "hue", 0, 360),
    lightness: createProperty(value, "lightness", 0, 100),
    saturation: createProperty(value, "saturation", 0, 100),
    value: { value }
  });
  return instance;
};
var createProperty = function(store, key, min, max) {
  return {
    get() {
      return store[key];
    },
    set(value) {
      store[key] = clamp(value, min, max);
    }
  };
};
var createRgb = function(original) {
  const value = { ...original };
  const instance = Object.create({
    toHex() {
      return rgbToHex(value);
    },
    toHsl() {
      return rgbToHsl(value);
    },
    toString() {
      return `rgb(${value.red}, ${value.green}, ${value.blue})`;
    }
  });
  Object.defineProperties(instance, {
    blue: createProperty(value, "blue", 0, 255),
    green: createProperty(value, "green", 0, 255),
    red: createProperty(value, "red", 0, 255),
    value: { value }
  });
  return instance;
};
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
function getHexColour(value) {
  return createHex(anyPattern.test(value) ? getNormalisedHex(value) : "000000");
}
var getNormalisedHex = function(value) {
  const normalised = value.replace(/^#/, "");
  return normalised.length === 3 ? normalised.split("").map((character) => character.repeat(2)).join("") : normalised;
};
function hexToRgb(value) {
  const hex = anyPattern.test(value) ? getNormalisedHex(value) : "";
  const pairs = groupedPattern.exec(hex) ?? [];
  const rgb = [];
  const { length } = pairs;
  for (let index = 1;index < length; index += 1) {
    rgb.push(Number.parseInt(pairs[index], 16));
  }
  return createRgb({ blue: rgb[2] ?? 0, green: rgb[1] ?? 0, red: rgb[0] ?? 0 });
}
function hslToRgb(value) {
  let hue = value.hue % 360;
  if (hue < 0) {
    hue += 360;
  }
  const saturation = value.saturation / 100;
  const lightness = value.lightness / 100;
  function get(value2) {
    const part = (value2 + hue / 30) % 12;
    const mod = saturation * Math.min(lightness, 1 - lightness);
    return lightness - mod * Math.max(-1, Math.min(part - 3, 9 - part, 1));
  }
  return createRgb({
    blue: clamp(Math.round(get(4) * 255), 0, 255),
    green: clamp(Math.round(get(8) * 255), 0, 255),
    red: clamp(Math.round(get(0) * 255), 0, 255)
  });
}
function rgbToHex(value) {
  return createHex(`${[value.red, value.green, value.blue].map((colour) => {
    const hex = colour.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }).join("")}`);
}
function rgbToHsl(rgb) {
  const blue = rgb.blue / 255;
  const green = rgb.green / 255;
  const red = rgb.red / 255;
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
  return createHsl({
    hue: +hue.toFixed(2),
    lightness: +(lightness * 100).toFixed(2),
    saturation: +(saturation * 100).toFixed(2)
  });
}
var anyPattern = /^#*([a-f0-9]{3}){1,2}$/i;
var groupedPattern = /^#*([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;
// src/js/element/index.ts
function findElement(selector, context) {
  return findElementOrElements(selector, context, true);
}
var findElementOrElements = function(selector, context, single) {
  const callback = single ? document.querySelector : document.querySelectorAll;
  const contexts = context == null ? [document] : findElementOrElements(context, undefined, false);
  const result = [];
  if (typeof selector === "string") {
    const { length: length2 } = contexts;
    for (let index = 0;index < length2; index += 1) {
      const value = callback.call(contexts[index], selector);
      if (single) {
        if (value == null) {
          continue;
        }
        return value;
      }
      result.push(...Array.from(value));
    }
    return single ? undefined : result.filter((value, index, array) => array.indexOf(value) === index);
  }
  const nodes = Array.isArray(selector) ? selector : selector instanceof NodeList ? Array.from(selector) : [selector];
  const { length } = nodes;
  for (let index = 0;index < length; index += 1) {
    const node = nodes[index];
    const element = node instanceof Document ? node.body : node instanceof Element ? node : undefined;
    if (element != null && (context == null || contexts.length === 0 || contexts.some((context2) => context2 === element || context2.contains(element))) && !result.includes(element)) {
      result.push(element);
    }
  }
  return result;
};
function findElements(selector, context) {
  return findElementOrElements(selector, context, false);
}
function findParentElement(origin, selector) {
  if (origin == null || selector == null) {
    return null;
  }
  if (typeof selector === "string") {
    if (origin.matches?.(selector)) {
      return origin;
    }
    return origin.closest(selector);
  }
  if (selector(origin)) {
    return origin;
  }
  let parent = origin.parentElement;
  while (parent != null && !selector(parent)) {
    if (parent === document.body) {
      return null;
    }
    parent = parent.parentElement;
  }
  return parent;
}
function getData(element, keys) {
  if (typeof keys === "string") {
    return getDataValue(element, keys);
  }
  const data = {};
  for (const key of keys) {
    data[key] = getDataValue(element, key);
  }
  return data;
}
var getDataValue = function(element, key) {
  const value = element.dataset[key];
  if (value == null) {
    return;
  }
  try {
    return JSON.parse(value);
  } catch {
    return;
  }
};
function getElementUnderPointer(skipIgnore) {
  const elements = Array.from(document.querySelectorAll(":hover")).filter((element) => {
    if (/^head$/i.test(element.tagName)) {
      return false;
    }
    const style = getComputedStyle(element);
    return skipIgnore === true || style.pointerEvents !== "none" && style.visibility !== "hidden";
  });
  return elements[elements.length - 1];
}
function getTextDirection(element) {
  const direction = element.getAttribute("dir");
  if (direction !== null && /^(ltr|rtl)$/i.test(direction)) {
    return direction.toLowerCase();
  }
  return getComputedStyle?.(element)?.direction === "rtl" ? "rtl" : "ltr";
}
function setData(element, first, second) {
  setValues(element, first, second, updateDataAttribute);
}
function setStyles(element, first, second) {
  setValues(element, first, second, updateStyleProperty);
}
var setValues = function(element, first, second, callback) {
  if (isPlainObject(first)) {
    const entries = Object.entries(first);
    for (const [key, value] of entries) {
      callback(element, key, value);
    }
  } else if (first != null) {
    callback(element, first, second);
  }
};
var updateDataAttribute = function(element, key, value) {
  updateValue(element, `data-${key}`, value, element.setAttribute, element.removeAttribute, true);
};
var updateStyleProperty = function(element, key, value) {
  updateValue(element, key, value, function(key2, value2) {
    this.style[key2] = value2;
  }, function(key2) {
    this.style[key2] = "";
  }, false);
};
var updateValue = function(element, key, value, set, remove, json) {
  if (isNullableOrWhitespace(value)) {
    remove.call(element, key);
  } else {
    set.call(element, key, json ? JSON.stringify(value) : String(value));
  }
};
// src/js/element/focusable.ts
function getFocusableElements(parent) {
  return getValidElements(parent, getFocusableFilters(), false);
}
var getFocusableFilters = function() {
  return [isDisabled, isInert, isHidden, isSummarised];
};
var getItem = function(element, tabbable) {
  return {
    element,
    tabIndex: tabbable ? getTabIndex(element) : -1
  };
};
var getTabbableFilters = function() {
  return [isNotTabbable, isNotTabbableRadio, ...getFocusableFilters()];
};
function getTabbableElements(parent) {
  return getValidElements(parent, getTabbableFilters(), true);
}
var getTabIndex = function(element) {
  const tabIndex = element?.tabIndex ?? -1;
  if (tabIndex < 0 && (/^(audio|details|video)$/i.test(element.tagName) || isEditable(element)) && !hasTabIndex(element)) {
    return 0;
  }
  return tabIndex;
};
var getValidElements = function(parent, filters, tabbable) {
  const items = Array.from(parent.querySelectorAll(selector)).map((element) => getItem(element, tabbable)).filter((item) => !filters.some((filter2) => filter2(item)));
  if (!tabbable) {
    return items.map((item) => item.element);
  }
  const indiced = [];
  const zeroed = [];
  const { length } = items;
  for (let index = 0;index < length; index += 1) {
    const item = items[index];
    if (item.tabIndex === 0) {
      zeroed.push(item.element);
    } else {
      indiced[item.tabIndex] = [
        ...indiced[item.tabIndex] ?? [],
        item.element
      ];
    }
  }
  return [...indiced.flat(), ...zeroed];
};
var hasTabIndex = function(element) {
  return !Number.isNaN(Number.parseInt(element.getAttribute("tabindex"), 10));
};
var isDisabled = function(item) {
  if (/^(button|input|select|textarea)$/i.test(item.element.tagName) && isDisabledFromFieldset(item.element)) {
    return true;
  }
  return (item.element.disabled ?? false) || item.element.getAttribute("aria-disabled") === "true";
};
var isDisabledFromFieldset = function(element) {
  let parent = element.parentElement;
  while (parent !== null) {
    if (parent instanceof HTMLFieldSetElement && parent.disabled) {
      const children = Array.from(parent.children);
      const { length } = children;
      for (let index = 0;index < length; index += 1) {
        const child = children[index];
        if (child instanceof HTMLLegendElement) {
          return parent.matches("fieldset[disabled] *") ? true : !child.contains(element);
        }
      }
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
};
var isEditable = function(element) {
  return /^(|true)$/i.test(element.getAttribute("contenteditable"));
};
function isFocusableElement(element) {
  return isValidElement(element, getFocusableFilters(), false);
}
var isHidden = function(item) {
  if ((item.element.hidden ?? false) || item.element instanceof HTMLInputElement && item.element.type === "hidden") {
    return true;
  }
  const isDirectSummary = item.element.matches("details > summary:first-of-type");
  const nodeUnderDetails = isDirectSummary ? item.element.parentElement : item.element;
  if (nodeUnderDetails?.matches("details:not([open]) *") ?? false) {
    return true;
  }
  const style = getComputedStyle(item.element);
  if (style.display === "none" || style.visibility === "hidden") {
    return true;
  }
  const { height, width } = item.element.getBoundingClientRect();
  return height === 0 && width === 0;
};
var isInert = function(item) {
  return (item.element.inert ?? false) || /^(|true)$/i.test(item.element.getAttribute("inert")) || item.element.parentElement !== null && isInert({
    element: item.element.parentElement,
    tabIndex: -1
  });
};
var isNotTabbable = function(item) {
  return (item.tabIndex ?? -1) < 0;
};
var isNotTabbableRadio = function(item) {
  if (!(item.element instanceof HTMLInputElement) || item.element.type !== "radio" || !item.element.name || item.element.checked) {
    return false;
  }
  const parent = item.element.form ?? item.element.getRootNode?.() ?? item.element.ownerDocument;
  const realName = CSS?.escape?.(item.element.name) ?? item.element.name;
  const radios = Array.from(parent.querySelectorAll(`input[type="radio"][name="${realName}"]`));
  const checked = radios.find((radio) => radio.checked);
  return checked !== undefined && checked !== item.element;
};
var isSummarised = function(item) {
  return item.element instanceof HTMLDetailsElement && Array.from(item.element.children).some((child) => /^summary$/i.test(child.tagName));
};
function isTabbableElement(element) {
  return isValidElement(element, getTabbableFilters(), true);
}
var isValidElement = function(element, filters, tabbable) {
  const item = getItem(element, tabbable);
  return !filters.some((filter2) => filter2(item));
};
var selector = [
  '[contenteditable]:not([contenteditable="false"])',
  "[tabindex]:not(slot)",
  "a[href]",
  "audio[controls]",
  "button",
  "details",
  "details > summary:first-of-type",
  "input",
  "select",
  "textarea",
  "video[controls]"
].map((selector2) => `${selector2}:not([inert])`).join(",");
// src/js/equal.ts
function equal(first, second) {
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
      return equalNested(first, second);
    default:
      return Object.is(first, second);
  }
}
var equalArrayBuffer = function(first, second) {
  return first.byteLength === second.byteLength ? equalNested(new Uint8Array(first), new Uint8Array(second)) : false;
};
var equalDataView = function(first, second) {
  return first.byteOffset === second.byteOffset ? equalArrayBuffer(first.buffer, second.buffer) : false;
};
var equalMap = function(first, second) {
  if (first.size !== second.size) {
    return false;
  }
  const firstKeys = [...first.keys()];
  const secondKeys = [...second.keys()];
  if (firstKeys.some((key) => !secondKeys.includes(key))) {
    return false;
  }
  for (const [key, value] of first) {
    if (!equal(value, second.get(key))) {
      return false;
    }
  }
  return true;
};
var equalNested = function(first, second) {
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
};
var equalProperties = function(first, second, properties) {
  for (const key of properties) {
    if (!Object.is(first[key], second[key])) {
      return false;
    }
  }
  return true;
};
var equalSet = function(first, second) {
  if (first.size !== second.size) {
    return false;
  }
  for (const value of first) {
    if (!second.has(value)) {
      return false;
    }
  }
  return true;
};
// src/js/emitter.ts
var createObserable = function(emitter, observers) {
  const instance = Object.create({
    subscribe(first, second, third) {
      return createSubscription(emitter, observers, getObserver(first, second, third));
    }
  });
  return instance;
};
var createSubscription = function(emitter, observers, observer) {
  let closed = false;
  const instance = Object.create({
    unsubscribe() {
      if (!closed) {
        closed = true;
        observers.delete(instance);
      }
    }
  });
  Object.defineProperty(instance, "closed", {
    get() {
      return closed || !emitter.active;
    }
  });
  observers.set(instance, observer);
  observer.next?.(emitter.value);
  return instance;
};
var getObserver = function(first, second, third) {
  let observer;
  if (typeof first === "object") {
    observer = first;
  } else {
    observer = {
      error: second,
      next: first,
      complete: third
    };
  }
  return observer;
};
function emitter(value) {
  let active = true;
  let stored = value;
  function finish(emit) {
    if (active) {
      active = false;
      for (const [subscription, observer] of observers) {
        if (emit) {
          observer.complete?.();
        }
        subscription.unsubscribe();
      }
    }
  }
  const observers = new Map;
  const instance = Object.create({
    destroy() {
      finish(false);
    },
    emit(value2, complete) {
      if (active) {
        stored = value2;
        for (const [, observer] of observers) {
          observer.next?.(value2);
        }
        if (complete === true) {
          finish(true);
        }
      }
    },
    error(error, complete) {
      if (active) {
        for (const [, observer] of observers) {
          observer.error?.(error);
        }
        if (complete === true) {
          finish(true);
        }
      }
    },
    finish() {
      finish(true);
    }
  });
  const observable = createObserable(instance, observers);
  Object.defineProperties(instance, {
    active: {
      get() {
        return active;
      }
    },
    observable: {
      get() {
        return observable;
      }
    },
    value: {
      get() {
        return stored;
      }
    }
  });
  return instance;
}
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
var time = function(label) {
  const started = logger.enabled;
  let stopped = false;
  if (started) {
    console.time(label);
  }
  return Object.create({
    log() {
      if (started && !stopped && logger.enabled) {
        console.timeLog(label);
      }
    },
    stop() {
      if (started && !stopped) {
        stopped = true;
        console.timeEnd(label);
      }
    }
  });
};
var work = function(type, data) {
  if (logger.enabled) {
    console[type](...data);
  }
};
if (globalThis._atomic_logging == null) {
  globalThis._atomic_logging = true;
}
var types = new Set([
  "dir",
  "debug",
  "error",
  "info",
  "log",
  "table",
  "trace",
  "warn"
]);
var logger = (() => {
  const instance = Object.create(null);
  Object.defineProperties(instance, {
    enabled: {
      get() {
        return _atomic_logging ?? true;
      },
      set(value) {
        _atomic_logging = value;
      }
    },
    time: {
      value: time
    }
  });
  for (const type of types) {
    Object.defineProperty(instance, type, {
      value: (...data) => work(type, data)
    });
  }
  return instance;
})();
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
// src/js/queue.ts
function queue(callback) {
  _atomic_queued.add(callback);
  if (_atomic_queued.size > 0) {
    queueMicrotask(() => {
      const callbacks = Array.from(_atomic_queued);
      _atomic_queued.clear();
      for (const callback2 of callbacks) {
        callback2();
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
// src/js/random.ts
function getRandomBoolean() {
  return Math.random() > 0.5;
}
function getRandomColour() {
  return `#${Array.from({ length: 6 }, getRandomHex).join("")}`;
}
function getRandomDate(earliest, latest) {
  const earliestTime = earliest?.getTime() ?? -8640000000000000;
  const latestTime = latest?.getTime() ?? 8640000000000000;
  return new Date(getRandomInteger(earliestTime, latestTime));
}
function getRandomFloat(min2, max2) {
  const minimum = min2 ?? Number.MIN_SAFE_INTEGER;
  return Math.random() * ((max2 ?? Number.MAX_SAFE_INTEGER) - minimum) + minimum;
}
function getRandomInteger(min2, max2) {
  return Math.floor(getRandomFloat(min2, max2));
}
function getRandomHex() {
  return "0123456789ABCDEF"[getRandomInteger(0, 16)];
}
// src/js/function.ts
function noop() {
}

// src/js/timer.ts
var getValueOrDefault = function(value, defaultValue) {
  return typeof value === "number" && value > 0 ? value : defaultValue;
};
var is5 = function(value, pattern) {
  return pattern.test(value?.$timer);
};
function isRepeated(value) {
  return is5(value, /^repeat$/);
}
function isTimer(value) {
  return is5(value, /^repeat|wait$/);
}
function isWaited(value) {
  return is5(value, /^wait$/);
}
function isWhen(value) {
  return is5(value, /^when$/) && typeof value.then === "function";
}
function repeat(callback, options) {
  return timer("repeat", callback, options ?? {}, true);
}
var timer = function(type, callback, partial, start) {
  const isRepeated2 = type === "repeat";
  const options = {
    afterCallback: partial.afterCallback,
    count: getValueOrDefault(partial.count, isRepeated2 ? Number.POSITIVE_INFINITY : 1),
    errorCallback: partial.errorCallback,
    interval: getValueOrDefault(partial.interval, 0),
    timeout: getValueOrDefault(partial.timeout, isRepeated2 ? Number.POSITIVE_INFINITY : 30000)
  };
  const state = {
    callback,
    active: false,
    minimum: options.interval - options.interval % milliseconds / 2,
    paused: false
  };
  const instance = Object.create({
    continue() {
      return work2("continue", this, state, options, isRepeated2);
    },
    pause() {
      return work2("pause", this, state, options, isRepeated2);
    },
    restart() {
      return work2("restart", this, state, options, isRepeated2);
    },
    start() {
      return work2("start", this, state, options, isRepeated2);
    },
    stop() {
      return work2("stop", this, state, options, isRepeated2);
    }
  });
  Object.defineProperties(instance, {
    $timer: {
      get() {
        return type;
      }
    },
    active: {
      get() {
        return state.active;
      }
    },
    paused: {
      get() {
        return state.paused;
      }
    }
  });
  if (start) {
    instance.start();
  }
  return instance;
};
function wait(callback, options) {
  return timer("wait", callback, options == null || typeof options === "number" ? {
    interval: options
  } : options, true);
}
function when(condition, options) {
  let rejecter;
  let resolver;
  const repeated = timer("repeat", () => {
    if (condition()) {
      repeated.stop();
      resolver?.();
    }
  }, {
    afterCallback() {
      if (!repeated.paused) {
        if (condition()) {
          resolver?.();
        } else {
          rejecter?.();
        }
      }
    },
    errorCallback() {
      rejecter?.();
    },
    count: options?.count,
    interval: options?.interval,
    timeout: options?.timeout
  }, false);
  const promise = new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });
  const instance = Object.create({
    continue() {
      repeated.continue();
    },
    pause() {
      repeated.pause();
    },
    stop() {
      if (repeated.active) {
        repeated.stop();
        rejecter?.();
      }
    },
    then(resolve, reject) {
      repeated.start();
      return promise.then(resolve ?? noop, reject ?? noop);
    }
  });
  Object.defineProperties(instance, {
    $timer: {
      get() {
        return "when";
      }
    },
    active: {
      get() {
        return repeated.active;
      }
    }
  });
  return instance;
}
var work2 = function(type, timer2, state, options, isRepeated2) {
  if (["continue", "start"].includes(type) && state.active || ["pause", "stop"].includes(type) && !state.active) {
    return timer2;
  }
  const { count, interval, timeout } = options;
  const { minimum } = state;
  if (["pause", "stop"].includes(type)) {
    const isStop = type === "stop";
    activeTimers.delete(timer2);
    cancelAnimationFrame(state.frame);
    if (isStop) {
      options.afterCallback?.(false);
    }
    state.active = false;
    state.frame = undefined;
    state.paused = !isStop;
    if (isStop) {
      state.elapsed = undefined;
      state.index = undefined;
    }
    return timer2;
  }
  state.active = true;
  state.paused = false;
  const canTimeout = timeout > 0 && timeout < Number.POSITIVE_INFINITY;
  const elapsed = type === "continue" ? +(state.elapsed ?? 0) : 0;
  let index = type === "continue" ? +(state.index ?? 0) : 0;
  state.elapsed = elapsed;
  state.index = index;
  const total = (count === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : (count - index) * (interval > 0 ? interval : milliseconds)) - elapsed;
  let current;
  let start;
  function finish(finished, error) {
    activeTimers.delete(timer2);
    state.active = false;
    state.elapsed = undefined;
    state.frame = undefined;
    state.index = undefined;
    if (error) {
      options.errorCallback?.();
    }
    options.afterCallback?.(finished);
  }
  function step(timestamp) {
    if (!state.active) {
      return;
    }
    current ??= timestamp;
    start ??= timestamp;
    const time2 = timestamp - current;
    state.elapsed = elapsed + (current - start);
    const finished = time2 - elapsed >= total;
    if (timestamp - start >= timeout - elapsed) {
      finish(finished, !finished);
      return;
    }
    if (finished || time2 >= minimum) {
      if (state.active) {
        state.callback(isRepeated2 ? index : undefined);
      }
      index += 1;
      state.index = index;
      if (!finished && index < count) {
        current = null;
      } else {
        finish(true, false);
        return;
      }
    }
    state.frame = requestAnimationFrame(step);
  }
  activeTimers.add(timer2);
  state.frame = requestAnimationFrame(step);
  return timer2;
};
var activeTimers = new Set;
var hiddenTimers = new Set;
var milliseconds = 16.666666666666668;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    for (const timer2 of activeTimers) {
      hiddenTimers.add(timer2);
      timer2.pause();
    }
  } else {
    for (const timer2 of hiddenTimers) {
      timer2.continue();
    }
    hiddenTimers.clear();
  }
});
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
// src/js/value.ts
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
var findKey = function(needle, haystack, ignoreCase) {
  if (!ignoreCase) {
    return needle;
  }
  const keys = Object.keys(haystack);
  const normalised = keys.map((key) => key.toLowerCase());
  const index = normalised.indexOf(needle.toLowerCase());
  return index > -1 ? keys[index] : needle;
};
var getDiffs = function(first, second, prefix) {
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
      if (!Object.is(from, to)) {
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
};
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
var handleValue = function(data, path, value, get, ignoreCase) {
  if (typeof data === "object" && data !== null && !/^(__proto__|constructor|prototype)$/i.test(path)) {
    const key = findKey(path, data, ignoreCase);
    if (get) {
      return data[key];
    }
    data[key] = value;
  }
};
function merge(...values) {
  if (values.length === 0) {
    return {};
  }
  const actual = values.filter((value) => isArrayOrPlainObject(value));
  const result = actual.every(Array.isArray) ? [] : {};
  const { length } = actual;
  for (let outerIndex = 0;outerIndex < length; outerIndex += 1) {
    const item = actual[outerIndex];
    const keys = Object.keys(item);
    const size = keys.length;
    for (let innerIndex = 0;innerIndex < size; innerIndex += 1) {
      const key = keys[innerIndex];
      const next = item[key];
      const previous = result[key];
      if (isArrayOrPlainObject(next)) {
        result[key] = isArrayOrPlainObject(previous) ? merge(previous, next) : merge(next);
      } else {
        result[key] = next;
      }
    }
  }
  return result;
}
function setValue(data, path, value, ignoreCase) {
  const shouldIgnoreCase = ignoreCase === true;
  const parts = (shouldIgnoreCase ? path.toLowerCase() : path).split(".");
  const { length } = parts;
  const lastIndex = length - 1;
  let target = typeof data === "object" ? data ?? {} : {};
  for (let index = 0;index < length; index += 1) {
    const part = parts[index];
    if (parts.indexOf(part) === lastIndex) {
      handleValue(target, part, value, false, shouldIgnoreCase);
      break;
    }
    let next = handleValue(target, part, null, true, shouldIgnoreCase);
    if (typeof next !== "object" || next === null) {
      next = /^\d+$/.test(part) ? [] : {};
      target[part] = next;
    }
    target = next;
  }
  return data;
}
export {
  words,
  when,
  wait,
  unique,
  truncate,
  titleCase,
  sum,
  splice,
  sort,
  snakeCase,
  setValue,
  setStyles,
  setData,
  round,
  rgbToHsl,
  rgbToHex,
  repeat,
  queue,
  push,
  pascalCase,
  min,
  merge,
  max,
  logger,
  kebabCase,
  join,
  isWhen,
  isWaited,
  isTimer,
  isTabbableElement,
  isRepeated,
  isPrimitive,
  isPlainObject,
  isObject,
  isNumerical,
  isNumber,
  isNullableOrWhitespace,
  isNullableOrEmpty,
  isNullable,
  isFocusableElement,
  isEmpty,
  isArrayOrPlainObject,
  insert,
  indexOf,
  hslToRgb,
  hexToRgb,
  groupBy,
  getValue,
  getTextDirection,
  getTabbableElements,
  getString,
  getRandomInteger,
  getRandomHex,
  getRandomFloat,
  getRandomDate,
  getRandomColour,
  getRandomBoolean,
  getPosition,
  getNumber,
  getHexColour,
  getForegroundColour,
  getFocusableElements,
  getElementUnderPointer,
  getData,
  findParentElement,
  findElements,
  findElement,
  find,
  filter,
  exists,
  equal,
  emitter,
  diff,
  createUuid,
  clone,
  clamp,
  chunk,
  capitalise as capitalize,
  capitalise,
  camelCase,
  between,
  average,
  findElements as $$,
  findElement as $
};
