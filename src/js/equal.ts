import {isPlainObject} from './is';
import type {ArrayOrPlainObject, PlainObject} from './models';

/**
 * Are two strings equal? _(Case-sensitive by default)_
 */
export function equal(
	first: string,
	second: string,
	ignoreCase?: boolean,
): boolean;

/**
 * Are two values equal? _(Does a deep comparison, if needed)_
 */
export function equal(first: unknown, second: unknown): boolean;

export function equal(
	first: unknown,
	second: unknown,
	ignoreCase?: boolean,
): boolean {
	switch (true) {
		case first === second:
			return true;

		case first == null || second == null:
			return first === second;

		case typeof first !== typeof second:
			return false;

		case first instanceof ArrayBuffer && second instanceof ArrayBuffer:
			return equalArrayBuffer(first, second);

		case typeof first === 'boolean':
		case first instanceof Date && second instanceof Date:
			return Object.is(Number(first), Number(second));

		case first instanceof DataView && second instanceof DataView:
			return equalDataView(first, second);

		case first instanceof Error && second instanceof Error:
			return equalProperties(first, second, ['name', 'message']);

		case first instanceof Map && second instanceof Map:
			return equalMap(first, second);

		case first instanceof RegExp && second instanceof RegExp:
			return equalProperties(first, second, ['source', 'flags']);

		case first instanceof Set && second instanceof Set:
			return equalSet(first, second);

		case Array.isArray(first) && Array.isArray(second):
		case isPlainObject(first) && isPlainObject(second):
			return equalNested(first, second);

		case typeof first === 'string' && ignoreCase === true:
			return Object.is(first.toLowerCase(), (second as string).toLowerCase());

		default:
			return Object.is(first, second);
	}
}

function equalArrayBuffer(first: ArrayBuffer, second: ArrayBuffer): boolean {
	return first.byteLength === second.byteLength
		? equalNested(
				new Uint8Array(first) as never,
				new Uint8Array(second) as never,
			)
		: false;
}

function equalDataView(first: DataView, second: DataView): boolean {
	return first.byteOffset === second.byteOffset
		? equalArrayBuffer(first.buffer, second.buffer)
		: false;
}

function equalMap(
	first: Map<unknown, unknown>,
	second: Map<unknown, unknown>,
): boolean {
	if (first.size !== second.size) {
		return false;
	}

	const firstKeys = [...first.keys()];
	const secondKeys = [...second.keys()];

	if (firstKeys.some(key => !secondKeys.includes(key))) {
		return false;
	}

	for (const [key, value] of first) {
		if (!equal(value, second.get(key))) {
			return false;
		}
	}

	return true;
}

function equalNested(
	first: ArrayOrPlainObject,
	second: ArrayOrPlainObject,
): boolean {
	const firstKeys = Object.keys(first);
	const secondKeys = Object.keys(second);
	const {length} = firstKeys;

	if (
		length !== secondKeys.length ||
		firstKeys.some(key => !secondKeys.includes(key))
	) {
		return false;
	}

	for (let index = 0; index < length; index += 1) {
		const key = firstKeys[index];

		if (!equal(first[key as never], second[key as never])) {
			return false;
		}
	}

	return true;
}

function equalProperties(
	first: object,
	second: object,
	properties: string[],
): boolean {
	for (const key of properties) {
		if (!Object.is((first as PlainObject)[key], (second as PlainObject)[key])) {
			return false;
		}
	}

	return true;
}

function equalSet(first: Set<unknown>, second: Set<unknown>): boolean {
	const {size} = first;

	if (size !== second.size) {
		return false;
	}

	const values = [...second];

	for (const item of first) {
		if (!values.some(value => equal(item, value))) {
			return false;
		}
	}

	return true;
}
