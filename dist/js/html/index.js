// src/js/is.ts
function isPlainObject(value2) {
  if (typeof value2 !== "object" || value2 === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value2);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value2) && !(Symbol.iterator in value2);
}

// src/js/element/attribute.ts
function isBadAttribute(name, value2) {
  return onPrefix.test(name) || sourcePrefix.test(name) && valuePrefix.test(value2);
}
function isEmptyNonBooleanAttribute(name, value2) {
  return !booleanAttributes.includes(name) && value2.trim().length === 0;
}
function isInvalidBooleanAttribute(name, value2) {
  if (!booleanAttributes.includes(name)) {
    return true;
  }
  const normalised = value2.toLowerCase().trim();
  return !(normalised.length === 0 || normalised === name || name === "hidden" && normalised === "until-found");
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
// src/js/html/sanitise.ts
function sanitise(value2, options) {
  return sanitiseNodes(Array.isArray(value2) ? value2 : [value2], {
    sanitiseBooleanAttributes: options?.sanitiseBooleanAttributes ?? true
  });
}
function sanitiseAttributes(element2, attributes, options) {
  const { length } = attributes;
  for (let index = 0;index < length; index += 1) {
    const { name, value: value2 } = attributes[index];
    if (isBadAttribute(name, value2) || isEmptyNonBooleanAttribute(name, value2)) {
      element2.removeAttribute(name);
    } else if (options.sanitiseBooleanAttributes && isInvalidBooleanAttribute(name, value2)) {
      element2.setAttribute(name, "");
    }
  }
}
function sanitiseNodes(nodes, options) {
  const { length } = nodes;
  for (let index = 0;index < length; index += 1) {
    const node = nodes[index];
    if (node instanceof Element) {
      sanitiseAttributes(node, [...node.attributes], options);
    }
    sanitiseNodes([...node.childNodes], options);
  }
  return nodes;
}

// src/js/html/index.ts
function createTemplate(html) {
  const template2 = document.createElement("template");
  template2.innerHTML = html;
  templates[html] = template2;
  return template2;
}
function getNodes(node) {
  return /^documentfragment$/i.test(node.constructor.name) ? [...node.childNodes] : [node];
}
function getTemplate(value2) {
  if (value2.trim().length === 0) {
    return;
  }
  let template2;
  if (/^[\w-]+$/.test(value2)) {
    template2 = document.querySelector(`#${value2}`);
  }
  if (template2 instanceof HTMLTemplateElement) {
    return template2;
  }
  return templates[value2] ?? createTemplate(value2);
}
function html(value2, sanitisation) {
  const options = sanitisation == null || sanitisation === true ? {} : isPlainObject(sanitisation) ? { ...sanitisation } : null;
  const template2 = value2 instanceof HTMLTemplateElement ? value2 : typeof value2 === "string" ? getTemplate(value2) : null;
  if (template2 == null) {
    return [];
  }
  const cloned = template2.content.cloneNode(true);
  const scripts = cloned.querySelectorAll("script");
  const { length } = scripts;
  for (let index = 0;index < length; index += 1) {
    scripts[index].remove();
  }
  cloned.normalize();
  return options != null ? sanitise(getNodes(cloned), options) : getNodes(cloned);
}
var templates = {};
export {
  sanitise,
  html
};
