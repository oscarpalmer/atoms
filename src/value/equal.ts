import {isPlainObject, isTypedArray} from '../is';
import type {ArrayOrPlainObject, PlainObject, TypedArray} from '../models';

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
	return equalValue(first, second, ignoreCase === true);
}

function equalArrayBuffer(
	first: ArrayBuffer,
	second: ArrayBuffer,
	ignoreCase: boolean,
): boolean {
	return first.byteLength === second.byteLength
		? equalObject(
				new Uint8Array(first) as never,
				new Uint8Array(second) as never,
				true,
				ignoreCase,
			)
		: false;
}

function equalDataView(
	first: DataView,
	second: DataView,
	ignoreCase: boolean,
): boolean {
	return first.byteOffset === second.byteOffset
		? equalArrayBuffer(
				first.buffer as ArrayBuffer,
				second.buffer as ArrayBuffer,
				ignoreCase,
			)
		: false;
}

function equalMap(
	first: Map<unknown, unknown>,
	second: Map<unknown, unknown>,
	ignoreCase: boolean,
): boolean {
	const {size} = first;

	if (size !== second.size) {
		return false;
	}

	const firstKeys = [...first.keys()];
	const secondKeys = [...second.keys()];

	if (firstKeys.some(key => !secondKeys.includes(key))) {
		return false;
	}

	for (let index = 0; index < size; index += 1) {
		const key = firstKeys[index];

		if (!equalValue(first.get(key), second.get(key), ignoreCase)) {
			return false;
		}
	}

	return true;
}

function equalObject(
	first: ArrayOrPlainObject,
	second: ArrayOrPlainObject,
	arrays: boolean,
	ignoreCase: boolean,
): boolean {
	let offset = 0;

	if (arrays) {
		const firstArray = first as unknown[];
		const secondArray = second as unknown[];
		const {length} = firstArray;

		if (length !== secondArray.length) {
			return false;
		}

		if (length >= 100) {
			offset = Math.round(length / 10);
			offset = offset > 25 ? 25 : offset;

			for (let index = 0; index < offset; index += 1) {
				if (
					!equalValue(firstArray[index], secondArray[index], ignoreCase) ||
					!equalValue(
						firstArray[length - index - 1],
						secondArray[length - index - 1],
						ignoreCase,
					)
				) {
					return false;
				}
			}
		}
	}

	const firstKeys = [
		...Object.keys(first),
		...Object.getOwnPropertySymbols(first),
	];

	const secondKeys = [
		...Object.keys(second),
		...Object.getOwnPropertySymbols(second),
	];

	let {length} = firstKeys;

	if (
		length !== secondKeys.length ||
		firstKeys.some(key => !secondKeys.includes(key))
	) {
		return false;
	}

	length -= offset;

	for (let index = offset; index < length; index += 1) {
		const key = firstKeys[index];

		if (!equalValue(first[key as never], second[key as never], ignoreCase)) {
			return false;
		}
	}

	return true;
}

function equalProperties(
	first: object,
	second: object,
	properties: string[],
	ignoreCase: boolean,
): boolean {
	const {length} = properties;

	for (let index = 0; index < length; index += 1) {
		const property = properties[index];

		if (
			!equalValue(
				(first as PlainObject)[property],
				(second as PlainObject)[property],
				ignoreCase,
			)
		) {
			return false;
		}
	}

	return true;
}

function equalSet(
	first: Set<unknown>,
	second: Set<unknown>,
	ignoreCase: boolean,
): boolean {
	const {size} = first;

	if (size !== second.size) {
		return false;
	}

	const firstValues = [...first];
	const secondValues = [...second];

	for (let index = 0; index < size; index += 1) {
		const firstValue = firstValues[index];

		if (
			!secondValues.some(secondValue =>
				equalValue(firstValue, secondValue, ignoreCase),
			)
		) {
			return false;
		}
	}

	return true;
}

function equalTypedArray(first: TypedArray, second: TypedArray): boolean {
	if (first.constructor !== second.constructor) {
		return false;
	}

	if (first.byteLength !== second.byteLength) {
		return false;
	}

	const {length} = first;

	for (let index = 0; index < length; index += 1) {
		if (first[index] !== second[index]) {
			return false;
		}
	}

	return true;
}

function equalValue(
	first: unknown,
	second: unknown,
	ignoreCase: boolean,
): boolean {
	switch (true) {
		case Object.is(first, second):
			return true;

		case first == null || second == null:
			return first === second;

		case typeof first !== typeof second:
			return false;

		case typeof first === 'string' && ignoreCase === true:
			return Object.is(
				first.toLocaleLowerCase(),
				(second as string).toLocaleLowerCase(),
			);

		default:
			break;
	}

	switch (true) {
		case first instanceof ArrayBuffer && second instanceof ArrayBuffer:
			return equalArrayBuffer(first, second, ignoreCase);

		case first instanceof Date && second instanceof Date:
			return Object.is(Number(first), Number(second));

		case first instanceof DataView && second instanceof DataView:
			return equalDataView(first, second, ignoreCase);

		case first instanceof Error && second instanceof Error:
			return equalProperties(first, second, ['name', 'message'], ignoreCase);

		case first instanceof Map && second instanceof Map:
			return equalMap(first, second, ignoreCase);

		case first instanceof RegExp && second instanceof RegExp:
			return equalProperties(first, second, ['source', 'flags'], ignoreCase);

		case first instanceof Set && second instanceof Set:
			return equalSet(first, second, ignoreCase);

		case Array.isArray(first) && Array.isArray(second):
			return equalObject(first, second, true, ignoreCase);

		case isPlainObject(first) && isPlainObject(second):
			return equalObject(first, second, false, ignoreCase);

		case isTypedArray(first) && isTypedArray(second):
			return equalTypedArray(first as TypedArray, second as TypedArray);

		default:
			return Object.is(first, second);
	}
}
