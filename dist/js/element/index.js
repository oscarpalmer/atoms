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
      if (single && value != null) {
        return value;
      }
      if (!single) {
        result.push(...Array.from(value));
      }
    }
    return single ? undefined : result.filter((value, index3, array) => array.indexOf(value) === index3);
  }
  const nodes = Array.isArray(selector) || selector instanceof NodeList ? selector : [selector];
  const { length } = nodes;
  let index = 0;
  for (;index < length; index += 1) {
    const node = nodes[index];
    const element = node instanceof Document ? node.body : node instanceof Element ? node : undefined;
    if (element == null) {
      continue;
    }
    if (context == null || contexts.some((context2) => context2.contains(node))) {
      if (single) {
        return element;
      }
      result.push(element);
    }
  }
  return single ? undefined : result.filter((value, index2, array) => array.indexOf(value) === index2);
};
function findElement(selector, context) {
  return _findElements(selector, context, true);
}
function findElements(selector, context) {
  return _findElements(selector, context, false);
}
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
    if (/^head$/i.test(element.tagName)) {
      return false;
    }
    const style = getComputedStyle(element);
    return typeof skipIgnore === "boolean" && skipIgnore || style.pointerEvents !== "none" && style.visibility !== "hidden";
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
export {
  getTextDirection,
  getElementUnderPointer,
  findParentElement,
  findElements,
  findElement,
  findElements as $$,
  findElement as $
};
