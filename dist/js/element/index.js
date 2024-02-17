// src/js/element/index.ts
function findElement(selector, context) {
  return findElements(selector, context)[0];
}
function findElements(selector, context) {
  const contexts = context === undefined ? [document] : findElements(context);
  const elements = [];
  if (typeof selector === "string") {
    for (const context2 of contexts) {
      elements.push(...Array.from(context2.querySelectorAll(selector) ?? []));
    }
    return elements;
  }
  const nodes = Array.isArray(selector) || selector instanceof NodeList ? selector : [selector];
  for (const node of nodes) {
    if (node instanceof Element && contexts.some((context2) => context2.contains(node))) {
      elements.push(node);
    }
  }
  return elements;
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
