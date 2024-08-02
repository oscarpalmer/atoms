// src/js/element/index.ts
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

// src/js/element/attribute.ts
function isBadAttribute(name, value) {
  return onPrefix.test(name) || sourcePrefix.test(name) && valuePrefix.test(value);
}
function isBooleanAttribute(name) {
  return booleanAttributes.includes(name.toLowerCase());
}
function isEmptyNonBooleanAttribute(name, value) {
  return !booleanAttributes.includes(name) && value.trim().length === 0;
}
function isInvalidBooleanAttribute(name, value) {
  if (!booleanAttributes.includes(name)) {
    return true;
  }
  const normalised = value.toLowerCase().trim();
  return !(normalised.length === 0 || normalised === name || name === "hidden" && normalised === "until-found");
}
function setAttribute(element, name, value) {
  if (value == null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, typeof value === "string" ? value : JSON.stringify(value));
  }
}
var booleanAttributes = Object.freeze([
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
]);
var onPrefix = /^on/i;
var sourcePrefix = /^(href|src|xlink:href)$/i;
var valuePrefix = /(data:text\/html|javascript:)/i;
// src/js/element/closest.ts
function calculateDistance(origin, target) {
  if (origin === target || origin.parentElement === target) {
    return 0;
  }
  const comparison = origin.compareDocumentPosition(target);
  const children = [...origin.parentElement?.children ?? []];
  switch (true) {
    case children.includes(target):
      return Math.abs(children.indexOf(origin) - children.indexOf(target));
    case !!(comparison & 2 || comparison & 8):
      return traverse(origin, target);
    case !!(comparison & 4 || comparison & 16):
      return traverse(target, origin);
    default:
      return -1;
  }
}
function closest(origin, selector, context) {
  if (origin.matches(selector)) {
    return [origin];
  }
  const elements = [...(context ?? document).querySelectorAll(selector)];
  const { length } = elements;
  if (length === 0) {
    return [];
  }
  const distances = [];
  let minimum = null;
  for (let index = 0;index < length; index += 1) {
    const element = elements[index];
    const distance = calculateDistance(origin, element);
    if (distance < 0) {
      continue;
    }
    if (minimum == null || distance < minimum) {
      minimum = distance;
    }
    distances.push({
      distance,
      element
    });
  }
  return minimum == null ? [] : distances.filter((found) => found.distance === minimum).map((found) => found.element);
}
function traverse(from, to) {
  const children = [...to.children];
  if (children.includes(from)) {
    return children.indexOf(from) + 1;
  }
  let current = from;
  let distance = 0;
  let parent = from.parentElement;
  while (parent != null) {
    if (parent === to) {
      return distance + 1;
    }
    const children2 = [...parent.children ?? []];
    if (children2.includes(to)) {
      return distance + Math.abs(children2.indexOf(current) - children2.indexOf(to));
    }
    const index = children2.findIndex((child) => child.contains(to));
    if (index > -1) {
      return distance + Math.abs(index - children2.indexOf(current)) + traverse(to, children2[index]);
    }
    current = parent;
    distance += 1;
    parent = parent.parentElement;
  }
  return -1e6;
}
// src/js/string/index.ts
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
function parse(value2, reviver) {
  try {
    return JSON.parse(value2, reviver);
  } catch {
  }
}
// src/js/is.ts
function isNullableOrWhitespace(value2) {
  return value2 == null || /^\s*$/.test(getString(value2));
}
function isPlainObject(value2) {
  if (typeof value2 !== "object" || value2 === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value2);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value2) && !(Symbol.iterator in value2);
}

// src/js/internal/element-value.ts
function setElementValues(element, first, second, callback) {
  if (isPlainObject(first)) {
    const entries = Object.entries(first);
    const { length } = entries;
    for (let index = 0;index < length; index += 1) {
      const [key, value2] = entries[index];
      callback(element, key, value2);
    }
  } else if (first != null) {
    callback(element, first, second);
  }
}
function updateElementValue(element, key, value2, set3, remove, json) {
  if (isNullableOrWhitespace(value2)) {
    remove.call(element, key);
  } else {
    set3.call(element, key, json ? JSON.stringify(value2) : String(value2));
  }
}

// src/js/element/data.ts
function getData(element, keys) {
  if (typeof keys === "string") {
    return getDataValue(element, keys);
  }
  const data = {};
  const { length } = keys;
  for (let index = 0;index < length; index += 1) {
    const key = keys[index];
    data[key] = getDataValue(element, key);
  }
  return data;
}
function getDataValue(element, key) {
  const value2 = element.dataset[key];
  if (value2 != null) {
    return parse(value2);
  }
}
function setData(element, first, second) {
  setElementValues(element, first, second, updateDataAttribute);
}
function updateDataAttribute(element, key, value2) {
  updateElementValue(element, `data-${key}`, value2, element.setAttribute, element.removeAttribute, true);
}
// src/js/element/find.ts
function findElement(selector, context) {
  return findElementOrElements(selector, context, true);
}
function findElementOrElements(selector, context, single) {
  const callback = single ? document.querySelector : document.querySelectorAll;
  const contexts = context == null ? [document] : findElementOrElements(context, undefined, false);
  const result = [];
  if (typeof selector === "string") {
    const { length: length2 } = contexts;
    for (let index = 0;index < length2; index += 1) {
      const value2 = callback.call(contexts[index], selector);
      if (single) {
        if (value2 == null) {
          continue;
        }
        return value2;
      }
      result.push(...Array.from(value2));
    }
    return single ? undefined : result.filter((value2, index, array2) => array2.indexOf(value2) === index);
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
}
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
// src/js/element/style.ts
function setStyles(element, first, second) {
  setElementValues(element, first, second, updateStyleProperty);
}
function updateStyleProperty(element, key, value2) {
  updateElementValue(element, key, value2, function(key2, value3) {
    this.style[key2] = value3;
  }, function(key2) {
    this.style[key2] = "";
  }, false);
}
export {
  setStyles,
  setData,
  setAttribute,
  isInvalidBooleanAttribute,
  isEmptyNonBooleanAttribute,
  isBooleanAttribute,
  isBadAttribute,
  getTextDirection,
  getElementUnderPointer,
  getData,
  findParentElement,
  findElements,
  findElement,
  closest,
  booleanAttributes,
  findElements as $$,
  findElement as $
};
