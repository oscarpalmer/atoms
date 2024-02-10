// src/js/element/index.ts
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
function getElementUnderPointer(skipIgnore) {
  const elements = Array.from(document.querySelectorAll(":hover")).filter((element) => {
    if (headPattern.test(element.tagName)) {
      return false;
    }
    const style = getComputedStyle(element);
    return typeof skipIgnore === "boolean" && skipIgnore || style.pointerEvents !== "none" && style.visibility !== "hidden";
  });
  return elements[elements.length - 1];
}
function getTextDirection(element) {
  const attribute = element.getAttribute("dir");
  if (attribute !== null && directionPattern.test(attribute)) {
    return attribute.toLowerCase();
  }
  return getComputedStyle?.(element)?.direction === "rtl" ? "rtl" : "ltr";
}
var directionPattern = /^(ltr|rtl)$/i;
var headPattern = /^head$/i;
// src/js/element/focusable.ts
var _getItem = function(type, element) {
  return {
    element,
    tabIndex: type === "focusable" ? -1 : _getTabIndex(element)
  };
};
var _getTabIndex = function(element) {
  if (element.tabIndex < 0 && (audioDetailsVideoPattern.test(element.tagName) || _isEditable(element)) && !_hasTabIndex(element)) {
    return 0;
  }
  return element.tabIndex;
};
var _getValidElements = function(type, parent, filters) {
  const items = Array.from(parent.querySelectorAll(selector)).map((element) => _getItem(type, element)).filter((item) => !filters.some((filter) => filter(item)));
  if (type === "focusable") {
    return items.map((item) => item.element);
  }
  const indiced = [];
  const zeroed = [];
  const { length } = items;
  let position = Number(length);
  while (position--) {
    const index = length - position - 1;
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
  if (inputPattern.test(item.element.tagName) && _isDisabledFromFieldset(item.element)) {
    return true;
  }
  return (item.element.disabled ?? false) || item.element.getAttribute("aria-disabled") === "true";
};
var _isDisabledFromFieldset = function(element) {
  let parent = element.parentElement;
  while (parent !== null) {
    if (parent instanceof HTMLFieldSetElement && parent.disabled) {
      const children = Array.from(parent.children);
      for (const child of children) {
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
  return booleanPattern.test(element.getAttribute("contenteditable"));
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
  return (item.element.inert ?? false) || booleanPattern.test(item.element.getAttribute("inert")) || item.element.parentElement !== null && _isInert({
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
  return item.element instanceof HTMLDetailsElement && Array.from(item.element.children).some((child) => summaryPattern.test(child.tagName));
};
var _isValidElement = function(element, filters) {
  const item = _getItem("focusable", element);
  return !filters.some((filter) => filter(item));
};
function getFocusableElements(parent) {
  return _getValidElements("focusable", parent, focusableFilters);
}
function getTabbableElements(parent) {
  return _getValidElements("tabbable", parent, tabbableFilters);
}
function isFocusableElement(element) {
  return _isValidElement(element, focusableFilters);
}
function isTabbableElement(element) {
  return _isValidElement(element, tabbableFilters);
}
var audioDetailsVideoPattern = /^(audio|details|video)$/i;
var booleanPattern = /^(|true)$/i;
var focusableFilters = [
  _isDisabled,
  _isInert,
  _isHidden,
  _isSummarised
];
var inputPattern = /^(button|input|select|textarea)$/i;
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
var summaryPattern = /^summary$/i;
var tabbableFilters = [
  _isNotTabbable,
  _isNotTabbableRadio,
  ...focusableFilters
];
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
  setValue,
  isTabbableElement,
  isObject,
  isNullableOrWhitespace,
  isNullable,
  isFocusableElement,
  isArrayOrObject,
  getValue,
  getTextDirection,
  getTabbableElements,
  getString,
  getPosition,
  getNumber,
  getFocusableElements,
  getElementUnderPointer,
  findParentElement,
  createUuid,
  clampNumber
};
