// src/js/string.ts
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
function parse(value, reviver) {
  try {
    return JSON.parse(value, reviver);
  } catch {
  }
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
  if (value != null) {
    return parse(value);
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
export {
  setStyles,
  setData,
  getTextDirection,
  getElementUnderPointer,
  getData,
  findParentElement,
  findElements,
  findElement,
  findElements as $$,
  findElement as $
};
