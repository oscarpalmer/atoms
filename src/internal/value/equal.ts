import type {ArrayOrPlainObject, PlainObject, TypedArray} from '../../models';
import {chunk} from '../array/chunk';
import {isPlainObject, isTypedArray} from '../is';

type EqualOptions = {
	/**
	 * When `true`, strings are compared case-insensitively
	 */
	ignoreCase?: boolean;
	/**
	 * Keys _(or key expressions)_ to ignore when comparing objects
	 */
	ignoreKeys?: string | RegExp | Array<string | RegExp>;
	/**
	 * Should `null` and `undefined` be considered equal?
	 */
	relaxedNullish?: boolean;
};

/**
 * Are two values equal?
 * @param first First value
 * @param second Second value
 * @returns `true` if the values are equal, otherwise `false`
 */
type Equalizer = (first: unknown, second: unknown) => boolean;

type Options = {
	ignoreCase: boolean;
	ignoreExpressions: OptionsKeys<RegExp[]>;
	ignoreKeys: OptionsKeys<Set<string>>;
	relaxedNullish: boolean;
};

type OptionsKeys<Values> = {
	enabled: boolean;
	values: Values;
};

//

/**
 * Are two strings equal?
 * @param first First string
 * @param second Second string
 * @param ignoreCase If `true`, comparison will be case-insensitive
 * @returns `true` if the strings are equal, otherwise `false`
 */
function equal(first: string, second: string, ignoreCase?: boolean): boolean;

/**
 * Are two values equal?
 * @param first First value
 * @param second Second value
 * @param options Comparison options
 * @returns `true` if the values are equal, otherwise `false`
 */
function equal(first: unknown, second: unknown, options?: EqualOptions): boolean;

function equal(first: unknown, second: unknown, options?: boolean | EqualOptions): boolean {
	return equalValue(first, second, getEqualOptions(options));
}

namespace equal {
	/**
	 * Create an equalizer with predefined options
	 * @param options Comparison options
	 * @returns Equalizer function
	 */
	export function initialize(options?: EqualOptions): Equalizer {
		const actual = getEqualOptions(options);

		return (first: unknown, second: unknown): boolean => equalValue(first, second, actual);
	}
}

function equalArray(first: unknown[], second: unknown[], options: Options): boolean {
	const {length} = first;

	if (length !== second.length) {
		return false;
	}

	let offset = 0;

	if (length >= ARRAY_THRESHOLD) {
		offset = Math.round(length / ARRAY_PEEK_PERCENTAGE);
		offset = offset > ARRAY_THRESHOLD ? ARRAY_THRESHOLD : offset;

		for (let index = 0; index < offset; index += 1) {
			if (
				!(
					equalValue(first[index], second[index], options) &&
					equalValue(first[length - index - 1], second[length - index - 1], options)
				)
			) {
				return false;
			}
		}
	}

	const firstChunks = chunk(first.slice(offset, length - offset), ARRAY_THRESHOLD);

	const secondChunks = chunk(second.slice(offset, length - offset), ARRAY_THRESHOLD);

	const chunksLength = firstChunks.length;

	for (let chunkIndex = 0; chunkIndex < chunksLength; chunkIndex += 1) {
		const firstChunk = firstChunks[chunkIndex];
		const secondChunk = secondChunks[chunkIndex];
		const chunkLength = firstChunk.length;

		for (let index = 0; index < chunkLength; index += 1) {
			if (!equalValue(firstChunk[index], secondChunk[index], options)) {
				return false;
			}
		}
	}

	return true;
}

function equalArrayBuffer(first: ArrayBuffer, second: ArrayBuffer, options: Options): boolean {
	return first.byteLength === second.byteLength
		? equalArray(new Uint8Array(first) as never, new Uint8Array(second) as never, options)
		: false;
}

function equalDataView(first: DataView, second: DataView, options: Options): boolean {
	return first.byteOffset === second.byteOffset
		? equalArrayBuffer(first.buffer as ArrayBuffer, second.buffer as ArrayBuffer, options)
		: false;
}

function equalMap(
	first: Map<unknown, unknown>,
	second: Map<unknown, unknown>,
	options: Options,
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

		if (!equalValue(first.get(key), second.get(key), options)) {
			return false;
		}
	}

	return true;
}

function equalObject(
	first: ArrayOrPlainObject,
	second: ArrayOrPlainObject,
	options: Options,
): boolean {
	const firstKeys = [...Object.keys(first), ...Object.getOwnPropertySymbols(first)].filter(key =>
		filterKey(key, options),
	);

	const secondKeys = [...Object.keys(second), ...Object.getOwnPropertySymbols(second)].filter(key =>
		filterKey(key, options),
	);

	const {length} = firstKeys;

	if (length !== secondKeys.length || firstKeys.some(key => !secondKeys.includes(key))) {
		return false;
	}

	for (let index = 0; index < length; index += 1) {
		const key = firstKeys[index];

		if (!equalValue(first[key as never], second[key as never], options)) {
			return false;
		}
	}

	return true;
}

function equalProperties(
	first: object,
	second: object,
	properties: string[],
	options: Options,
): boolean {
	const {length} = properties;

	for (let index = 0; index < length; index += 1) {
		const property = properties[index];

		if (!equalValue((first as PlainObject)[property], (second as PlainObject)[property], options)) {
			return false;
		}
	}

	return true;
}

function equalSet(first: Set<unknown>, second: Set<unknown>, options: Options): boolean {
	const {size} = first;

	if (size !== second.size) {
		return false;
	}

	const firstValues = [...first];
	const secondValues = [...second];

	for (let index = 0; index < size; index += 1) {
		const firstValue = firstValues[index];

		if (!secondValues.some(secondValue => equalValue(firstValue, secondValue, options))) {
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

function equalValue(first: unknown, second: unknown, options: Options): boolean {
	if (options.relaxedNullish === true && first == null && second == null) {
		return true;
	}

	switch (true) {
		case Object.is(first, second):
			return true;

		case first == null || second == null:
			return first === second;

		case typeof first !== typeof second:
			return false;

		case typeof first === 'string' && options.ignoreCase === true:
			return Object.is(first.toLocaleLowerCase(), (second as string).toLocaleLowerCase());

		case first instanceof ArrayBuffer && second instanceof ArrayBuffer:
			return equalArrayBuffer(first, second, options);

		case first instanceof Date && second instanceof Date:
			return Object.is(Number(first), Number(second));

		case first instanceof DataView && second instanceof DataView:
			return equalDataView(first, second, options);

		case first instanceof Error && second instanceof Error:
			return equalProperties(first, second, ['name', 'message'], options);

		case first instanceof Map && second instanceof Map:
			return equalMap(first, second, options);

		case first instanceof RegExp && second instanceof RegExp:
			return equalProperties(first, second, ['source', 'flags'], options);

		case first instanceof Set && second instanceof Set:
			return equalSet(first, second, options);

		case Array.isArray(first) && Array.isArray(second):
			return equalArray(first, second, options);

		case isPlainObject(first) && isPlainObject(second):
			return equalObject(first, second, options);

		case isTypedArray(first) && isTypedArray(second):
			return equalTypedArray(first as TypedArray, second as TypedArray);

		default:
			return Object.is(first, second);
	}
}

function filterKey(key: string | symbol, options: Options): boolean {
	if (typeof key !== 'string') {
		return true;
	}

	if (
		options.ignoreExpressions.enabled &&
		options.ignoreExpressions.values.some(expression => expression.test(key))
	) {
		return false;
	}

	if (options.ignoreKeys.enabled && options.ignoreKeys.values.has(key)) {
		return false;
	}

	return true;
}

function getEqualOptions(input?: boolean | EqualOptions): Options {
	const options: Options = {
		ignoreCase: false,
		ignoreExpressions: {
			enabled: false,
			values: [],
		},
		ignoreKeys: {
			enabled: false,
			values: new Set(),
		},
		relaxedNullish: false,
	};

	if (typeof input === 'boolean') {
		options.ignoreCase = input;

		return options;
	}

	if (!isPlainObject(input)) {
		return options;
	}

	options.ignoreCase = typeof input.ignoreCase === 'boolean' ? input.ignoreCase : false;

	options.ignoreExpressions.values = (
		Array.isArray(input.ignoreKeys) ? input.ignoreKeys : [input.ignoreKeys]
	).filter(key => key instanceof RegExp);

	options.ignoreKeys.values = new Set(
		(Array.isArray(input.ignoreKeys) ? input.ignoreKeys : [input.ignoreKeys]).filter(
			key => typeof key === 'string',
		),
	);

	options.ignoreExpressions.enabled = options.ignoreExpressions.values.length > 0;

	options.ignoreKeys.enabled = options.ignoreKeys.values.size > 0;

	options.relaxedNullish = input.relaxedNullish === true;

	return options;
}

//

const ARRAY_PEEK_PERCENTAGE = 10;

const ARRAY_THRESHOLD = 100;

//

export {equal};
