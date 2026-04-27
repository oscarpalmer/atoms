import {isNonPlainObject} from '../is';
import type {GenericCallback, PlainObject} from '../models';

// #region Types

type TransformCallback<Value extends PlainObject, Key extends keyof Value> = (
	key: Key,
	value: Value[Key],
) => Value[Key];

type TransformCallbacks<Value extends PlainObject> = Partial<{
	[Key in keyof Value]: (value: Value[Key]) => Value[Key];
}>;

export type Transformer<Value extends PlainObject> = {
	(value: Value): Value;
};

// #endregion

// #region Functions

function getTransformer<Value extends PlainObject, Key extends keyof Value>(
	input: unknown,
): TransformCallback<Value, Key> | TransformCallbacks<Value> | undefined {
	if (typeof input === 'function') {
		return input as GenericCallback;
	}

	if (isNonPlainObject(input)) {
		return;
	}

	const keys = Object.keys(input) as Key[];
	const {length} = keys;

	const transformer: Partial<TransformCallbacks<Value>> = {};

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const value = input[key];

		if (typeof value === 'function') {
			transformer[key] = value;
		}
	}

	if (Object.keys(transformer).length > 0) {
		return transformer;
	}
}

/**
 * Initialize a transformer for an object with a transformer function
 *
 * Available as `initializeTransformer` and `transform.initialize`
 * @param transform Transformer function
 * @returns Transformer
 */
export function initializeTransformer<Value extends PlainObject>(
	transform: TransformCallback<Value, keyof Value>,
): Transformer<Value>;

/**
 * Initialize a transformer for an object with transformer functions
 *
 * Available as `initializeTransformer` and `transform.initialize`
 * @param transformers Keyed transformer functions
 * @return Transformer
 */
export function initializeTransformer<Value extends PlainObject>(
	transformers: TransformCallbacks<Value>,
): Transformer<Value>;

export function initializeTransformer<Value extends PlainObject>(
	transform: unknown,
): Transformer<Value> {
	const transformer = getTransformer<Value, keyof Value>(transform);

	return value => transformValue(value, transformer);
}

/**
 * Transform and objects properties using a transformer functior
 * @param value Object to transform
 * @param transform Transformer function
 * @returns Transformed object
 */
export function transform<Value extends PlainObject, Key extends keyof Value>(
	value: Value,
	transform: TransformCallback<Value, Key>,
): Value;

/**
 * Transform and objects properties using a transformer object
 * @param value Object to transform
 * @param transformers Keyed transformer functions
 * @returns Transformed object
 */
export function transform<Value extends PlainObject>(
	value: Value,
	transformers: TransformCallbacks<Value>,
): Value;

export function transform<Value extends PlainObject>(value: Value, transform: unknown): Value {
	return transformValue(value, getTransformer(transform));
}

transform.initialize = initializeTransformer;

function transformValue<Value extends PlainObject, Key extends keyof Value>(
	value: Value,
	transformer?: TransformCallback<Value, Key> | TransformCallbacks<Value>,
): Value {
	if (isNonPlainObject(value)) {
		return {} as Value;
	}

	if (transformer == null) {
		return value;
	}

	const keys = Object.keys(value) as Key[];
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const val = value[key];

		if (typeof transformer === 'function') {
			value[key] = transformer(key, val) as Value[Key];
		} else {
			value[key] = (transformer[key]?.(val) ?? val) as Value[Key];
		}
	}

	return value;
}

// #endregion
