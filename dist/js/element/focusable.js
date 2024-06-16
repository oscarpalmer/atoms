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
  const items = Array.from(parent.querySelectorAll(selector)).map((element) => getItem(element, tabbable)).filter((item) => !filters.some((filter) => filter(item)));
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
  return !filters.some((filter) => filter(item));
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
export {
  isTabbableElement,
  isFocusableElement,
  getTabbableElements,
  getFocusableElements
};
