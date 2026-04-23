import type {ArrayOrPlainObject, Constructor, PlainObject, TypedArray} from '../../models';
import {isNonPlainObject, isPlainObject, isPrimitive, isTypedArray} from '../is';
import {getCompareHandlers} from './handlers';

// #region Types

/**
 * Options for value equality comparison
 */
export type EqualOptions = {
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

type Equalizer = {
	/**
	 * Are two strings equal?
	 * @param first First string
	 * @param second Second string
	 * @param ignoreCase If `true`, comparison will be case-insensitive
	 * @returns `true` if the strings are equal, otherwise `false`
	 */
	(first: string, second: string, ignoreCase?: boolean): boolean;

	/**
	 * Are two values equal?
	 * @param first First value
	 * @param second Second value
	 * @returns `true` if the values are equal, otherwise `false`
	 */
	(first: unknown, second: unknown): boolean;

	/**
	 * Deregister a equality comparison handler for a specific class
	 * @param constructor Class constructor
	 */
	deregister: <Instance>(constructor: Constructor<Instance>) => void;

	/**
	 * Register a equality comparison function for a specific class
	 * @param constructor Class constructor
	 * @param handler Comparison function
	 */
	register: <Instance>(
		constructor: Constructor<Instance>,
		handler: (first: Instance, second: Instance) => boolean,
	) => void;
};

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

// #endregion

// #region Functions

/**
 * Deregister a equality comparison handler for a specific class
 *
 * Available as `deregisterEqualizer` and `equal.deregister`
 * @param constructor Class constructor
 */
export function deregisterEqualizer<Instance>(constructor: Constructor<Instance>): void {
	equal.handlers.deregister(constructor);
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

/**
 * Are two strings equal?
 * @param first First string
 * @param second Second string
 * @param ignoreCase If `true`, comparison will be case-insensitive
 * @returns `true` if the strings are equal, otherwise `false`
 */
export function equal(first: string, second: string, ignoreCase?: boolean): boolean;

/**
 * Are two values equal?
 * @param first First value
 * @param second Second value
 * @param options Comparison options
 * @returns `true` if the values are equal, otherwise `false`
 */
export function equal(first: unknown, second: unknown, options?: EqualOptions): boolean;

export function equal(first: unknown, second: unknown, options?: boolean | EqualOptions): boolean {
	return equalValue(first, second, getEqualOptions(options));
}

equal.handlers = getCompareHandlers<boolean>(equal, {
	callback: Object.is,
});

equal.deregister = deregisterEqualizer;
equal.initialize = initializeEqualizer;
equal.register = registerEqualizer;

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

	const end = length - offset;

	for (let index = offset; index < end; index += 1) {
		if (!equalValue(first[index], second[index], options)) {
			return false;
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

	for (let index = 0; index < size; index += 1) {
		const key = firstKeys[index];

		if (!second.has(key) || !equalValue(first.get(key), second.get(key), options)) {
			return false;
		}
	}

	return true;
}

function equalPlainObject(
	first: ArrayOrPlainObject,
	second: ArrayOrPlainObject,
	options: Options,
): boolean {
	let firstKeys = [...Object.keys(first), ...Object.getOwnPropertySymbols(first)];
	let secondKeys = [...Object.keys(second), ...Object.getOwnPropertySymbols(second)];

	if (options.ignoreKeys.enabled || options.ignoreExpressions.enabled) {
		firstKeys = firstKeys.filter(key => filterKey(key, options));
		secondKeys = secondKeys.filter(key => filterKey(key, options));
	}

	const useSet = secondKeys.length >= MINIMUM_LENGTH_FOR_SET;
	const secondSet = useSet ? new Set(secondKeys) : undefined;

	const {length} = firstKeys;

	if (length !== secondKeys.length) {
		return false;
	}

	for (let index = 0; index < length; index += 1) {
		const key = firstKeys[index];

		if (
			!(secondSet?.has(key) ?? secondKeys.includes(key)) ||
			!equalValue(first[key as never], second[key as never], options)
		) {
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

		if (
			isPrimitive(firstValue)
				? !second.has(firstValue)
				: !secondValues.some(secondValue => equalValue(firstValue, secondValue, options))
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

function equalValue(first: unknown, second: unknown, options: Options): boolean {
	if (options.relaxedNullish && first == null && second == null) {
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
			return equalProperties(first, second, ERROR_PROPERTIES, options);

		case first instanceof Map && second instanceof Map:
			return equalMap(first, second, options);

		case first instanceof RegExp && second instanceof RegExp:
			return equalProperties(first, second, EXPRESSION_PROPERTIES, options);

		case first instanceof Set && second instanceof Set:
			return equalSet(first, second, options);

		case Array.isArray(first) && Array.isArray(second):
			return equalArray(first, second, options);

		case isPlainObject(first) && isPlainObject(second):
			return equalPlainObject(first, second, options);

		case isTypedArray(first) && isTypedArray(second):
			return equalTypedArray(first as TypedArray, second as TypedArray);

		default:
			return equal.handlers.handle(first, second, options);
	}
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

	if (isNonPlainObject(input)) {
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

/**
 * Create an equalizer with predefined options
 *
 * Available as `initializeEqualizer` and `equal.initialize`
 * @param options Comparison options
 * @returns Equalizer function
 */
export function initializeEqualizer(options?: EqualOptions): Equalizer {
	const actual = getEqualOptions(options);

	const equalizer = (first: unknown, second: unknown): boolean => equalValue(first, second, actual);

	equalizer.deregister = deregisterEqualizer;
	equalizer.register = registerEqualizer;

	return equalizer;
}

/**
 * Register a equality comparison function for a specific class
 *
 * Available as `registerEqualizer` and `equal.register`
 * @param constructor Class constructor
 * @param handler Comparison function
 */
export function registerEqualizer<Instance>(
	constructor: Constructor<Instance>,
	handler: (first: Instance, second: Instance) => boolean,
): void {
	equal.handlers.register(constructor, handler);
}

// #endregion

// #region Variables

const ARRAY_PEEK_PERCENTAGE = 10;

const ARRAY_THRESHOLD = 100;

const ERROR_PROPERTIES: string[] = ['name', 'message'];

const EXPRESSION_PROPERTIES: string[] = ['source', 'flags'];

const MINIMUM_LENGTH_FOR_SET = 16;

// #endregion
