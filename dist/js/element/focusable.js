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
export {
  isTabbableElement,
  isFocusableElement,
  getTabbableElements,
  getFocusableElements
};
