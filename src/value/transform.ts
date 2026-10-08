import {isNonPlainObject} from '../internal/is';
import type {PlainObject} from '../models/index';
import {
	TRANSFORM_SYMBOL,
	type InternalTransformer,
	type TransformCallback,
	type TransformCallbacks,
	type TransformHandler,
} from '../models/value/value.transform.model';

// #region Instances

function Transformer(this: any, transformer: ReturnType<typeof getTransformHandler>): void {
	this[TRANSFORM_SYMBOL] = transformer;
}

Object.defineProperties(Transformer.prototype, {
	transform: {
		value: transformValue,
	},
});

// #endregion

// #region Functions

function getTransformHandler<Value extends PlainObject, Key extends keyof Value>(
	input: unknown,
): TransformHandler<Value> | undefined {
	if (typeof input === 'function') {
		return input as TransformHandler<Value>;
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

	return Object.keys(transformer).length > 0 ? transformer : undefined;
}

/**
 * Initialize a transformer for an object with a transformer function
 *
 * _Available as `initializeTransformer` and `transform.initialize`_
 *
 * @param transform Transformer function
 * @returns Transformer
 */
export function initializeTransformer<Value extends PlainObject>(
	transform: TransformCallback<Value, keyof Value>,
): Transformer<Value>;

/**
 * Initialize a transformer for an object with transformer functions
 *
 * _Available as `initializeTransformer` and `transform.initialize`_
 *
 * @param transformers Keyed transformer functions
 * @returns Transformer
 */
export function initializeTransformer<Value extends PlainObject>(
	transformers: TransformCallbacks<Value>,
): Transformer<Value>;

export function initializeTransformer<Value extends PlainObject>(
	transform: unknown,
): Transformer<Value> {
	// @ts-expect-error All good, no worries :-)
	return new Transformer(getTransformHandler<Value>(transform));
}

/**
 * Transform and objects properties using a transformer function
 *
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
 *
 * @param value Object to transform
 * @param transformers Keyed transformer functions
 * @returns Transformed object
 */
export function transform<Value extends PlainObject>(
	value: Value,
	transformers: TransformCallbacks<Value>,
): Value;

export function transform<Value extends PlainObject>(value: Value, transform: unknown): Value {
	return transformValue.call(getTransformHandler(transform), value) as Value;
}

function transformValue<Value extends PlainObject, Key extends keyof Value>(
	this: InternalTransformer<Value> | TransformHandler<Value> | undefined,
	value: Value,
): Value {
	if (isNonPlainObject(value)) {
		return {} as Value;
	}

	if (this == null) {
		return value;
	}

	const transformer =
		TRANSFORM_SYMBOL in this ? (this as InternalTransformer<Value>)[TRANSFORM_SYMBOL] : this;

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

// #region Namespace

export declare namespace transform {
	export var initialize: typeof initializeTransformer;
}

// #endregion

// #region Initialization

transform.initialize = initializeTransformer;

// #endregion

// #region Exports

export type {TransformCallback, TransformCallbacks, Transformer};

// #endregion
