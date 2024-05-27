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
var _findElements = function(selector, context, single) {
  const callback = single ? document.querySelector : document.querySelectorAll;
  const contexts = context == null ? [document] : _findElements(context, undefined, false);
  const result = [];
  if (typeof selector === "string") {
    const { length: length2 } = contexts;
    let index2 = 0;
    for (;index2 < length2; index2 += 1) {
      const value = callback.call(contexts[index2], selector);
      if (single) {
        if (value == null) {
          continue;
        }
        return value;
      }
      result.push(...Array.from(value));
    }
    return single ? undefined : result.filter((value, index3, array) => array.indexOf(value) === index3);
  }
  const nodes = Array.isArray(selector) ? selector : selector instanceof NodeList ? Array.from(selector) : [selector];
  const { length } = nodes;
  let index = 0;
  for (;index < length; index += 1) {
    const node = nodes[index];
    const element = node instanceof Document ? node.body : node instanceof Element ? node : undefined;
    if (element != null && (context == null || contexts.length === 0 || contexts.some((context2) => context2 === element || context2.contains(element))) && !result.includes(element)) {
      result.push(element);
    }
  }
  return result;
};
function findElement(selector, context) {
  return _findElements(selector, context, true);
}
function findElements(selector, context) {
  return _findElements(selector, context, false);
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
// src/js/element/focusable.ts
var _getItem = function(element, tabbable) {
  return {
    element,
    tabIndex: tabbable ? _getTabIndex(element) : -1
  };
};
var _getFocusableFilters = function() {
  return [_isDisabled, _isInert, _isHidden, _isSummarised];
};
var _getTabbableFilters = function() {
  return [_isNotTabbable, _isNotTabbableRadio, ..._getFocusableFilters()];
};
var _getTabIndex = function(element) {
  const tabIndex = element?.tabIndex ?? -1;
  if (tabIndex < 0 && (/^(audio|details|video)$/i.test(element.tagName) || _isEditable(element)) && !_hasTabIndex(element)) {
    return 0;
  }
  return tabIndex;
};
var _getValidElements = function(parent, filters, tabbable) {
  const items = Array.from(parent.querySelectorAll(selector)).map((element) => _getItem(element, tabbable)).filter((item) => !filters.some((filter2) => filter2(item)));
  if (!tabbable) {
    return items.map((item) => item.element);
  }
  const indiced = [];
  const zeroed = [];
  const { length } = items;
  let index = 0;
  for (;index < length; index += 1) {
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
var _hasTabIndex = function(element) {
  return !Number.isNaN(Number.parseInt(element.getAttribute("tabindex"), 10));
};
var _isDisabled = function(item) {
  if (/^(button|input|select|textarea)$/i.test(item.element.tagName) && _isDisabledFromFieldset(item.element)) {
    return true;
  }
  return (item.element.disabled ?? false) || item.element.getAttribute("aria-disabled") === "true";
};
var _isDisabledFromFieldset = function(element) {
  let parent = element.parentElement;
  while (parent !== null) {
    if (parent instanceof HTMLFieldSetElement && parent.disabled) {
      const children = Array.from(parent.children);
      const { length } = children;
      let index = 0;
      for (;index < length; index += 1) {
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
var _isEditable = function(element) {
  return /^(|true)$/i.test(element.getAttribute("contenteditable"));
};
var _isHidden = function(item) {
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
var _isInert = function(item) {
  return (item.element.inert ?? false) || /^(|true)$/i.test(item.element.getAttribute("inert")) || item.element.parentElement !== null && _isInert({
    element: item.element.parentElement,
    tabIndex: -1
  });
};
var _isNotTabbable = function(item) {
  return (item.tabIndex ?? -1) < 0;
};
var _isNotTabbableRadio = function(item) {
  if (!(item.element instanceof HTMLInputElement) || item.element.type !== "radio" || !item.element.name || item.element.checked) {
    return false;
  }
  const parent = item.element.form ?? item.element.getRootNode?.() ?? item.element.ownerDocument;
  const realName = CSS?.escape?.(item.element.name) ?? item.element.name;
  const radios = Array.from(parent.querySelectorAll(`input[type="radio"][name="${realName}"]`));
  const checked = radios.find((radio) => radio.checked);
  return checked !== undefined && checked !== item.element;
};
var _isSummarised = function(item) {
  return item.element instanceof HTMLDetailsElement && Array.from(item.element.children).some((child) => /^summary$/i.test(child.tagName));
};
var _isValidElement = function(element, filters, tabbable) {
  const item = _getItem(element, tabbable);
  return !filters.some((filter2) => filter2(item));
};
function getFocusableElements(parent) {
  return _getValidElements(parent, _getFocusableFilters(), false);
}
function getTabbableElements(parent) {
  return _getValidElements(parent, _getTabbableFilters(), true);
}
function isFocusableElement(element) {
  return _isValidElement(element, _getFocusableFilters(), false);
}
function isTabbableElement(element) {
  return _isValidElement(element, _getTabbableFilters(), true);
}
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
// src/js/string.ts
function capitalise(value) {
  if (value.length === 0) {
    return value;
  }
  return value.length === 1 ? value.toLocaleUpperCase() : value.charAt(0).toLocaleUpperCase() + value.slice(1).toLocaleLowerCase();
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
function titleCase(value) {
  return value.split(/\s+/).map((word) => capitalise(word)).join(" ");
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
function getRandomFloat(min, max) {
  const minimum = min ?? Number.MIN_SAFE_INTEGER;
  return Math.random() * ((max ?? Number.MAX_SAFE_INTEGER) - minimum) + minimum;
}
function getRandomInteger(min, max) {
  return Math.floor(getRandomFloat(min, max));
}
function getRandomHex() {
  return "0123456789ABCDEF"[getRandomInteger(0, 16)];
}
// src/js/timer.ts
var is = function(value, pattern) {
  return pattern.test(value?.$timer);
};
function isRepeated(value) {
  return is(value, /^repeat$/);
}
function isTimer(value) {
  return is(value, /^repeat|wait$/);
}
function isWaited(value) {
  return is(value, /^wait$/);
}
function isWhen(value) {
  return is(value, /^when$/) && typeof value.then === "function";
}
function repeat(callback, options) {
  return timer("repeat", callback, {
    ...options ?? {},
    ...{
      count: typeof options?.count === "number" ? options.count > 0 ? options.count : 1 : Number.POSITIVE_INFINITY
    }
  }).start();
}
var timer = function(type, callback, options) {
  const extended = {
    afterCallback: options.afterCallback,
    count: typeof options.count === "number" && options.count > 0 ? options.count : 1,
    errorCallback: options.errorCallback,
    interval: typeof options.interval === "number" && options.interval >= 0 ? options.interval : 0,
    timeout: typeof options.timeout === "number" && options.timeout > 0 ? options.timeout : 30000
  };
  const state = {
    callback,
    active: false
  };
  const instance = Object.create({
    restart() {
      return work("restart", this, state, extended);
    },
    start() {
      return work("start", this, state, extended);
    },
    stop() {
      return work("stop", this, state, extended);
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
    }
  });
  return instance;
};
function wait(callback, options) {
  const optionsIsNumber = typeof options === "number";
  return timer("wait", callback, {
    count: 1,
    errorCallback: optionsIsNumber ? undefined : options?.errorCallback,
    interval: optionsIsNumber ? options : options?.interval ?? 0
  }).start();
}
function when(condition, options) {
  let rejecter;
  let resolver;
  const repeated = repeat(() => {
    if (condition()) {
      repeated.stop();
      resolver?.();
    }
  }, {
    errorCallback() {
      rejecter?.();
    },
    count: options?.count,
    interval: options?.interval,
    timeout: options?.timeout
  });
  const promise = new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });
  const instance = Object.create({
    stop() {
      if (repeated.active) {
        repeated.stop();
        rejecter?.();
      }
    },
    then(resolve, reject) {
      repeated.start();
      return promise.then(resolve, reject);
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
var work = function(type, timer2, state, options) {
  if (type === "start" && state.active || type === "stop" && !state.active) {
    return timer2;
  }
  const { count, interval, timeout } = options;
  if (typeof state.frame === "number") {
    cancelAnimationFrame(state.frame);
    options.afterCallback?.(false);
  }
  if (type === "stop") {
    state.active = false;
    state.frame = undefined;
    return timer2;
  }
  state.active = true;
  const isRepeated2 = count > 0;
  const total = count === Number.POSITIVE_INFINITY ? timeout : count * (interval > 0 ? interval : 17);
  let current;
  let start;
  let index = 0;
  function finish(finished, error) {
    state.active = false;
    state.frame = undefined;
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
    const elapsed = timestamp - current;
    const finished = elapsed >= total;
    if (finished || elapsed - 2 < interval && interval < elapsed + 2) {
      if (state.active) {
        state.callback(isRepeated2 ? index : undefined);
      }
      index += 1;
      switch (true) {
        case (!finished && timestamp - start >= timeout):
          finish(false, true);
          return;
        case (!finished && index < count):
          current = null;
          break;
        default:
          finish(true, false);
          return;
      }
    }
    state.frame = requestAnimationFrame(step);
  }
  state.frame = requestAnimationFrame(step);
  return timer2;
};
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
var _cloneNested = function(value) {
  const cloned = Array.isArray(value) ? [] : {};
  const keys = Object.keys(value);
  const { length } = keys;
  let index = 0;
  for (;index < length; index += 1) {
    const key = keys[index];
    cloned[key] = clone(value[key]);
  }
  return cloned;
};
var _cloneRegularExpression = function(value) {
  const cloned = new RegExp(value.source, value.flags);
  cloned.lastIndex = value.lastIndex;
  return cloned;
};
var _findKey = function(needle, haystack, ignoreCase) {
  if (!ignoreCase) {
    return needle;
  }
  const keys = Object.keys(haystack);
  const normalised = keys.map((key) => key.toLowerCase());
  const index = normalised.indexOf(needle.toLowerCase());
  return index > -1 ? keys[index] : needle;
};
var _getDiffs = function(first, second, prefix) {
  const changes = [];
  const checked = new Set;
  let outer = 0;
  for (;outer < 2; outer += 1) {
    const value = outer === 0 ? first : second;
    if (!value) {
      continue;
    }
    const keys = Object.keys(value);
    const { length } = keys;
    let inner = 0;
    for (;inner < length; inner += 1) {
      const key = keys[inner];
      if (checked.has(key)) {
        continue;
      }
      const from = first?.[key];
      const to = second?.[key];
      if (!Object.is(from, to)) {
        const prefixed = _getKey(prefix, key);
        const change = {
          from,
          to,
          key: prefixed
        };
        const nested = isArrayOrPlainObject(from) || isArrayOrPlainObject(to);
        const diffs = nested ? _getDiffs(from, to, prefixed) : [];
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
var _getKey = function(...parts) {
  return parts.filter((part) => part != null).join(".");
};
var _handleValue = function(data, path, value, get, ignoreCase) {
  if (typeof data === "object" && data !== null && !/^(__proto__|constructor|prototype)$/i.test(path)) {
    const key = _findKey(path, data, ignoreCase);
    if (get) {
      return data[key];
    }
    data[key] = value;
  }
};
function clone(value) {
  switch (true) {
    case value == null:
    case typeof value === "function":
      return value;
    case typeof value === "bigint":
      return BigInt(value);
    case typeof value === "boolean":
      return Boolean(value);
    case typeof value === "number":
      return Number(value);
    case typeof value === "string":
      return String(value);
    case typeof value === "symbol":
      return Symbol(value.description);
    case value instanceof Node:
      return value.cloneNode(true);
    case value instanceof RegExp:
      return _cloneRegularExpression(value);
    case isArrayOrPlainObject(value):
      return _cloneNested(value);
    default:
      return structuredClone(value);
  }
}
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
  const diffs = _getDiffs(first, second);
  const { length } = diffs;
  if (length === 0) {
    result.type = "none";
  }
  let index = 0;
  for (;index < length; index += 1) {
    const diff2 = diffs[index];
    result.values[diff2.key] = { from: diff2.from, to: diff2.to };
  }
  return result;
}
function getValue(data, path, ignoreCase) {
  const shouldIgnoreCase = ignoreCase === true;
  const parts = (shouldIgnoreCase ? path.toLowerCase() : path).split(".");
  const { length } = parts;
  let index = 0;
  let value = typeof data === "object" ? data ?? {} : {};
  while (index < length && value != null) {
    value = _handleValue(value, parts[index++], null, true, shouldIgnoreCase);
  }
  return value;
}
function merge(...values) {
  if (values.length === 0) {
    return {};
  }
  const actual = values.filter((value) => isArrayOrPlainObject(value));
  const result = actual.every(Array.isArray) ? [] : {};
  const { length } = actual;
  let itemIndex = 0;
  for (;itemIndex < length; itemIndex += 1) {
    const item = actual[itemIndex];
    const keys = Object.keys(item);
    const size = keys.length;
    let keyIndex = 0;
    for (;keyIndex < size; keyIndex += 1) {
      const key = keys[keyIndex];
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
  let index = 0;
  let target = typeof data === "object" ? data ?? {} : {};
  for (;index < length; index += 1) {
    const part = parts[index];
    if (parts.indexOf(part) === lastIndex) {
      _handleValue(target, part, value, false, shouldIgnoreCase);
      break;
    }
    let next = _handleValue(target, part, null, true, shouldIgnoreCase);
    if (typeof next !== "object" || next === null) {
      next = /^\d+$/.test(part) ? [] : {};
      target[part] = next;
    }
    target = next;
  }
  return data;
}
export {
  when,
  wait,
  unique,
  titleCase,
  splice,
  setValue,
  rgbToHsl,
  rgbToHex,
  repeat,
  queue,
  push,
  merge,
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
  findParentElement,
  findElements,
  findElement,
  find,
  filter,
  exists,
  diff,
  createUuid,
  clone,
  clamp,
  chunk,
  capitalise as capitalize,
  capitalise,
  between,
  findElements as $$,
  findElement as $
};
