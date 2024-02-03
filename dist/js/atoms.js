// src/js/element.ts
function findParentElement(origin, selector) {
  if (origin == null || selector == null) {
    return;
  }
  function matches(element) {
    return typeof selector === "string" ? element.matches?.(selector) ?? false : typeof selector === "function" ? selector(element) : false;
  }
  if (matches(origin)) {
    return origin;
  }
  let parent = origin.parentElement;
  while (parent != null && !matches(parent)) {
    if (parent === document.body) {
      return;
    }
    parent = parent.parentElement;
  }
  return parent ?? undefined;
}
function getElementUnderPointer(all) {
  const elements = Array.from(document.querySelectorAll(":hover")).filter((element) => {
    const style = window.getComputedStyle(element);
    return element.tagName !== "HEAD" && (typeof all === "boolean" && all ? true : style.pointerEvents !== "none" && style.visibility !== "hidden");
  });
  return elements[elements.length - 1];
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
// src/js/number.ts
function clampNumber(value, min, max) {
  return Math.min(Math.max(getNumber(value), getNumber(min)), getNumber(max));
}
function getNumber(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "symbol") {
    return NaN;
  }
  let parsed = value?.valueOf?.() ?? value;
  if (typeof parsed === "object") {
    parsed = parsed?.toString() ?? parsed;
  }
  if (typeof parsed !== "string") {
    return parsed == null ? NaN : typeof parsed === "number" ? parsed : +parsed;
  }
  if (zeroPattern.test(parsed)) {
    return 0;
  }
  const trimmed = parsed.trim();
  if (trimmed.length === 0) {
    return NaN;
  }
  const isBinary = binaryPattern.test(trimmed);
  if (isBinary || octalPattern.test(trimmed)) {
    return parseInt(trimmed.slice(2), isBinary ? 2 : 8);
  }
  return +(hexadecimalPattern.test(trimmed) ? trimmed : trimmed.replace(separatorPattern, ""));
}
var binaryPattern = /^0b[01]+$/i;
var hexadecimalPattern = /^0x[0-9a-f]+$/i;
var octalPattern = /^0o[0-7]+$/i;
var separatorPattern = /_/g;
var zeroPattern = /^\s*0+\s*$/;
// src/js/string.ts
function createUuid() {
  return uuidTemplate.replace(/[018]/g, (substring) => (substring ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> substring / 4).toString(16));
}
function getString(value) {
  return typeof value === "string" ? value : typeof value?.toString === "function" ? value.toString() : String(value);
}
function isNullableOrWhitespace(value) {
  return value == null || getString(value).trim().length === 0;
}
var uuidTemplate = "10000000-1000-4000-8000-100000000000";
// src/js/value.ts
var _getValue = function(data, key) {
  if (typeof data !== "object" || data === null || badProperties.has(key)) {
    return;
  }
  if (data instanceof Map) {
    return data.get(key);
  }
  return data[key];
};
var _setValue = function(data, key, value) {
  if (typeof data !== "object" || data === null || badProperties.has(key)) {
    return;
  }
  if (data instanceof Map) {
    data.set(key, value);
  } else {
    data[key] = value;
  }
};
function getValue(data, key) {
  if (typeof data !== "object" || data === null || isNullableOrWhitespace(key)) {
    return;
  }
  const parts = getString(key).split(".").reverse();
  let position = parts.length;
  let value = data;
  while (position--) {
    value = _getValue(value, parts[position]);
    if (value == null) {
      break;
    }
  }
  return value;
}
function isArrayOrObject(value) {
  return constructors.has(value?.constructor?.name);
}
function isNullable(value) {
  return value == null;
}
function isObject(value) {
  return value?.constructor?.name === objectConstructor;
}
function setValue(data, key, value) {
  if (typeof data !== "object" || data === null || isNullableOrWhitespace(key)) {
    return data;
  }
  const parts = getString(key).split(".").reverse();
  let position = parts.length;
  let target = data;
  while (position--) {
    const key2 = parts[position];
    if (position === 0) {
      _setValue(target, key2, value);
      break;
    }
    let next = _getValue(target, key2);
    if (typeof next !== "object" || next === null) {
      next = numberExpression.test(parts[position - 1]) ? [] : {};
      target[key2] = next;
    }
    target = next;
  }
  return data;
}
var badProperties = new Set(["__proto__", "constructor", "prototype"]);
var objectConstructor = "Object";
var constructors = new Set(["Array", objectConstructor]);
var numberExpression = /^\d+$/;
export {
  supportsTouch,
  setValue,
  isObject,
  isNullableOrWhitespace,
  isNullable,
  isArrayOrObject,
  getValue,
  getString,
  getPosition,
  getNumber,
  getElementUnderPointer,
  findParentElement,
  createUuid,
  clampNumber
};
