// #region Types

/**
 * A generic array or object
 */
export type ArrayOrPlainObject = unknown[] | Record<PropertyKey, unknown>;

/**
 * For mathicng any `void`, `Date`, primitive, or `RegExp` values
 *
 * (Thanks, type-fest!)
 */
export type BuiltIns = void | Date | Primitive | RegExp;

/**
 * An extend callback that can be canceled
 */
export type CancelableCallback<Callback extends GenericCallback> = Callback & {
	/**
	 * Cancel the callback
	 */
	cancel: () => void;
};

/**
 * A generic class constructor
 */
export type Constructor<Instance = unknown> = new (...args: any[]) => Instance;

/**
 * Position of an event
 */
export type EventPosition = {
	x: number;
	y: number;
};

/**
 * A generic async callback function
 */
export type GenericAsyncCallback = (...args: any[]) => Promise<any>;

/**
 * A generic callback function
 */
export type GenericCallback = (...args: any[]) => any;

/**
 * A generic key type
 */
export type Key = number | string;

export type KeyedValue<Item, Key extends keyof Item> = Item[Key] extends PropertyKey
	? Item[Key]
	: never;

/**
 * A nested array
 */
export type NestedArray<Value> =
	Value extends Array<infer NestedValue> ? NestedArray<NestedValue> : Value;

/**
 * All nested keys of an object as dot notation strings _(up to 5 levels deep)_
 */
export type NestedKeys<Value extends PlainObject> = _NestedKeys<Value>;

type _NestedKeys<Value, Depth extends number = 5> = Depth extends 0
	? never
	: Value extends readonly any[]
		? Value extends readonly [any, ...any]
			? // Tuple: extract actual indices
				{
					[Key in keyof Value]-?: Key extends `${number}`
						? NonNullable<Value[Key]> extends readonly any[] | PlainObject
							? `${Key}` | `${Key}.${_NestedKeys<NonNullable<Value[Key]>, SubtractDepth<Depth>>}`
							: `${Key}`
						: never;
				}[number]
			: // Array: use no indices
				never
		: Value extends PlainObject
			? {
					[Key in keyof Value]-?: Key extends number | string
						? NonNullable<Value[Key]> extends readonly any[] | PlainObject
							? `${Key}` | `${Key}.${_NestedKeys<NonNullable<Value[Key]>, SubtractDepth<Depth>>}`
							: `${Key}`
						: never;
				}[keyof Value]
			: never;

/**
 * An extended version of `Partial` that allows for nested properties to be optional
 */
export type NestedPartial<T> = {
	[K in keyof T]?: T[K] extends object ? NestedPartial<T[K]> : T[K];
};

/**
 * The value for a nested key of an object
 */
export type NestedValue<Value extends PlainObject, Path extends string> = _NestedValue<Value, Path>;

type _NestedValue<Value, Path extends string> = Path extends `${infer Key}.${infer Rest}`
	? Key extends keyof Value
		? undefined extends Value[Key]
			? _NestedValue<Exclude<Value[Key], undefined>, Rest> | undefined
			: _NestedValue<Value[Key], Rest>
		: Key extends `${number}`
			? Value extends readonly any[]
				? _NestedValue<Value[number], Rest>
				: never
			: never
	: Path extends `${number}`
		? Value extends readonly any[]
			? Value[number]
			: never
		: Path extends keyof Value
			? Value[Path]
			: never;

/**
 * The nested (keyed) values of an object _(up to 5 levels deep)_
 */
export type NestedValues<Value extends PlainObject> = {
	[Path in NestedKeys<Value>]: NestedValue<Value, Path>;
};

/**
 * The numerical keys of an object
 */
export type NumericalKeys<Value> = {
	[Key in keyof Value]: Key extends number ? Key : Key extends `${number}` ? Key : never;
}[keyof Value];

/**
 * The numerical values of an object
 */
export type NumericalValues<Item extends PlainObject> = {
	[Key in keyof Item as Item[Key] extends number ? Key : never]: Item[Key];
};

/**
 * A generic object
 */
export type PlainObject = Record<PropertyKey, unknown>;

/**
 * A primitive value
 *
 * _(Thanks, type-fest!)_
 */
export type Primitive = null | undefined | string | number | boolean | symbol | bigint;

/**
 * Set required keys for a type
 */
export type RequiredKeys<Model extends object, Keys extends keyof Model> = Required<
	Pick<Model, Keys>
> &
	Omit<Model, Keys>;

/**
 * Flattens the type to improve type hints in IDEs
 *
 * _(Thanks, type-fest!)_
 */
export type Simplify<Value> = {[Key in keyof Value]: Value[Key]} & {};

type SubtractDepth<Value extends number> = Value extends 5
	? 4
	: Value extends 4
		? 3
		: Value extends 3
			? 2
			: Value extends 2
				? 1
				: Value extends 1
					? 0
					: never;

/**
 * Get the value's type as a string
 *
 * _(Thanks, type-fest!)_
 */
export type ToString<Value> = Value extends string | number ? `${Value}` : never;

/**
 * A union type of all typed arrays
 */
export type TypedArray =
	| Int8Array
	| Uint8Array
	| Uint8ClampedArray
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Float32Array
	| Float64Array
	| BigInt64Array
	| BigUint64Array;

// #endregion
