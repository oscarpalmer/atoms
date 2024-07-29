import {setElementValues, updateElementValue} from '../internal/element-value';
import type {PlainObject} from '../models';
import {parse} from '../string';

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
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

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
	setElementValues(element, first, second, updateDataAttribute);
}

function updateDataAttribute(
	element: HTMLElement,
	key: string,
	value: unknown,
): void {
	updateElementValue(
		element,
		`data-${key}`,
		value,
		element.setAttribute,
		element.removeAttribute,
		true,
	);
}
