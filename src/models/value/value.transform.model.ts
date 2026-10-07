import type {PlainObject} from '../index';

// #region Types

export type InternalTransformer<Value extends PlainObject> = {
	[TRANSFORM_SYMBOL]: TransformHandler<Value>;
} & Transformer<Value>;

/**
 * A callback transform an object's properties
 */
export type TransformCallback<Value extends PlainObject, Key extends keyof Value> = (
	key: Key,
	value: Value[Key],
) => Value[Key];

/**
 * A collection of keyed callbacks to transform an object's properties
 */
export type TransformCallbacks<Value extends PlainObject> = Partial<{
	[Key in keyof Value]: (value: Value[Key]) => Value[Key];
}>;

export type TransformHandler<Value extends PlainObject> =
	| TransformCallback<Value, keyof Value>
	| TransformCallbacks<Value>;

/**
 * A transformer for an object, with predefined callbacks for transforming its properties
 */
export type Transformer<Value extends PlainObject> = {
	/**
	 * Transform an object's properties
	 *
	 * @param value Object to transform
	 * @returns Transformed object
	 */
	transform(value: Value): Value;
};

// #endregion

// #region Variables

export const TRANSFORM_SYMBOL: unique symbol = Symbol('transform');

// #endregion
