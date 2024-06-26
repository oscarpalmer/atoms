import {isNullableOrWhitespace, isPlainObject} from '../is';
import type {PlainObject} from '../models';
import {parse} from '../string';

type Selector = string | Document | Element | Element[] | NodeList;

type TextDirection = 'ltr' | 'rtl';

/**
 * - Find the first element that matches the selector
 * - `context` is optional and defaults to `document`
 */
export function findElement(
	selector: string,
	context?: Selector,
): Element | undefined {
	return findElementOrElements(selector, context, true) as never;
}

function findElementOrElements(
	selector: Selector,
	context: Selector | undefined,
	single: boolean,
): Element | Element[] | undefined {
	const callback = single ? document.querySelector : document.querySelectorAll;

	const contexts =
		context == null
			? [document]
			: (findElementOrElements(context, undefined, false) as Element[]);

	const result: Element[] = [];

	if (typeof selector === 'string') {
		const {length} = contexts;

		for (let index = 0; index < length; index += 1) {
			const value = callback.call(contexts[index], selector) as
				| Element
				| Element[]
				| null;

			if (single) {
				if (value == null) {
					continue;
				}

				return value;
			}

			result.push(...Array.from(value as Element[]));
		}

		return single
			? undefined
			: result.filter((value, index, array) => array.indexOf(value) === index);
	}

	const nodes = Array.isArray(selector)
		? selector
		: selector instanceof NodeList
			? Array.from(selector)
			: [selector];

	const {length} = nodes;

	for (let index = 0; index < length; index += 1) {
		const node = nodes[index];

		const element =
			node instanceof Document
				? node.body
				: node instanceof Element
					? node
					: undefined;

		if (
			element != null &&
			(context == null ||
				contexts.length === 0 ||
				contexts.some(
					context => context === element || context.contains(element),
				)) &&
			!result.includes(element)
		) {
			result.push(element);
		}
	}

	return result;
}

/**
 * - Find elements that match the selector
 * - If `selector` is a node or a list of nodes, they are filtered and returned
 * - `context` is optional and defaults to `document`
 */
export function findElements(
	selector: Selector,
	context?: Selector,
): Element[] {
	return findElementOrElements(selector, context, false) as never;
}

/**
 * - Find the parent element that matches the selector
 * - Matches may be found by a query string or a callback
 * - If no match is found, `undefined` is returned
 */
export function findParentElement(
	origin: Element,
	selector: string | ((element: Element) => boolean),
): Element | null {
	if (origin == null || selector == null) {
		return null;
	}

	if (typeof selector === 'string') {
		if (origin.matches?.(selector)) {
			return origin;
		}

		return origin.closest(selector);
	}

	if (selector(origin)) {
		return origin;
	}

	let parent: Element | null = origin.parentElement;

	while (parent != null && !selector(parent)) {
		if (parent === document.body) {
			return null;
		}

		parent = parent.parentElement;
	}

	return parent;
}

/**
 * Get data values from an element as an object
 */
export function getData<Value extends PlainObject>(
	element: HTMLElement,
	keys: string[],
): Value;

/**
 * Get a data value from an element
 */
export function getData(element: HTMLElement, key: string): unknown;

export function getData(
	element: HTMLElement,
	keys: string | string[],
): unknown {
	if (typeof keys === 'string') {
		return getDataValue(element, keys);
	}

	const data: PlainObject = {};

	for (const key of keys) {
		data[key] = getDataValue(element, key);
	}

	return data;
}

function getDataValue(element: HTMLElement, key: string): unknown {
	const value = element.dataset[key];

	if (value != null) {
		return parse(value);
	}
}

/**
 * - Get the most specific element under the pointer
 * - Ignores elements with `pointer-events: none` and `visibility: hidden`
 * - If `skipIgnore` is `true`, no elements are ignored
 */
export function getElementUnderPointer(
	skipIgnore?: boolean,
): Element | undefined {
	const elements = Array.from(document.querySelectorAll(':hover')).filter(
		element => {
			if (/^head$/i.test(element.tagName)) {
				return false;
			}

			const style = getComputedStyle(element);

			return (
				skipIgnore === true ||
				(style.pointerEvents !== 'none' && style.visibility !== 'hidden')
			);
		},
	);

	return elements[elements.length - 1];
}

/**
 * Get the text direction of an element
 */
export function getTextDirection(element: Element): TextDirection {
	const direction = element.getAttribute('dir');

	if (direction !== null && /^(ltr|rtl)$/i.test(direction)) {
		return direction.toLowerCase() as TextDirection;
	}

	return (
		getComputedStyle?.(element)?.direction === 'rtl' ? 'rtl' : 'ltr'
	) as TextDirection;
}

/**
 * Set data values on an element
 */
export function setData(element: HTMLElement, data: PlainObject): void;

/**
 * Set a data values on an element
 */
export function setData(
	element: HTMLElement,
	key: string,
	value: unknown,
): void;

export function setData(
	element: HTMLElement,
	first: PlainObject | string,
	second?: unknown,
): void {
	setValues(element, first, second, updateDataAttribute);
}

/**
 * Set styles on an element
 */
export function setStyles(
	element: HTMLElement,
	styles: Partial<CSSStyleDeclaration>,
): void;

/**
 * Set a style on an element
 */
export function setStyles(
	element: HTMLElement,
	key: keyof CSSStyleDeclaration,
	value?: string,
): void;

export function setStyles(
	element: HTMLElement,
	first: Partial<CSSStyleDeclaration> | keyof CSSStyleDeclaration,
	second?: unknown,
): void {
	setValues(element, first as string, second, updateStyleProperty);
}

function setValues(
	element: HTMLElement,
	first: PlainObject | string,
	second: unknown,
	callback: (element: HTMLElement, key: string, value: unknown) => void,
): void {
	if (isPlainObject(first)) {
		const entries = Object.entries(first);

		for (const [key, value] of entries) {
			callback(element, key, value);
		}
	} else if (first != null) {
		callback(element, first, second);
	}
}

function updateDataAttribute(
	element: HTMLElement,
	key: string,
	value: unknown,
): void {
	updateValue(
		element,
		`data-${key}`,
		value,
		element.setAttribute,
		element.removeAttribute,
		true,
	);
}

function updateStyleProperty(
	element: HTMLElement,
	key: string,
	value: unknown,
): void {
	updateValue(
		element,
		key,
		value,
		function (this: HTMLElement, key: string, value: string) {
			this.style[key as never] = value;
		},
		function (this: HTMLElement, key: string) {
			this.style[key as never] = '';
		},
		false,
	);
}

function updateValue(
	element: HTMLElement,
	key: string,
	value: unknown,
	set: (key: string, value: string) => void,
	remove: (key: string) => void,
	json: boolean,
): void {
	if (isNullableOrWhitespace(value)) {
		remove.call(element, key);
	} else {
		set.call(element, key, json ? JSON.stringify(value) : String(value));
	}
}

export {findElement as $, findElements as $$};

