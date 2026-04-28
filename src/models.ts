// #region Types

/**
 * A generic array or object
 */
export type ArrayOrPlainObject = unknown[] | Record<PropertyKey, unknown>;

/**
 * An asynchronous callback that can be canceled
 */
export type AsyncCancelableCallback<Callback extends GenericAsyncCallback | GenericCallback> =
	(ReturnType<Callback> extends Promise<any>
		? (...args: Parameters<Callback>) => Promise<Awaited<ReturnType<Callback>>>
		: (...args: Parameters<Callback>) => Promise<ReturnType<Callback>>) & {
		/**
		 * Cancel the callback
		 */
		cancel: () => void;
	};

/**
 * For matching any `void`, `Date`, primitive, or `RegExp` values
 *
 * (Thanks, type-fest!)
 */
export type BuiltIns = void | Date | Primitive | RegExp;

/**
 * A synchronous callback that can be canceled
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

export type KeyedValue<Item, ItemKey extends keyof Item> = Item[ItemKey] extends PropertyKey
	? Item[ItemKey]
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
					[ItemKey in keyof Value]-?: ItemKey extends `${number}`
						? NonNullable<Value[ItemKey]> extends readonly any[] | PlainObject
							?
									| `${ItemKey}`
									| `${ItemKey}.${_NestedKeys<NonNullable<Value[ItemKey]>, SubtractDepth<Depth>>}`
							: `${ItemKey}`
						: never;
				}[number]
			: // Array: use no indices
				never
		: Value extends PlainObject
			? {
					[ItemKey in keyof Value]-?: ItemKey extends number | string
						? NonNullable<Value[ItemKey]> extends readonly any[] | PlainObject
							?
									| `${ItemKey}`
									| `${ItemKey}.${_NestedKeys<NonNullable<Value[ItemKey]>, SubtractDepth<Depth>>}`
							: `${ItemKey}`
						: never;
				}[keyof Value]
			: never;

/**
 * An extended version of `Partial` that allows for nested properties to be optional
 */
export type NestedPartial<Value> = {
	[ItemKey in keyof Value]?: Value[ItemKey] extends object
		? NestedPartial<Value[ItemKey]>
		: Value[ItemKey];
};

/**
 * The value for a nested key of an object
 */
export type NestedValue<Value extends PlainObject, Path extends string> = _NestedValue<Value, Path>;

type _NestedValue<Value, Path extends string> = Path extends `${infer ItemKey}.${infer Rest}`
	? ItemKey extends keyof Value
		? undefined extends Value[ItemKey]
			? _NestedValue<Exclude<Value[ItemKey], undefined>, Rest> | undefined
			: _NestedValue<Value[ItemKey], Rest>
		: ItemKey extends `${number}`
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
	[ItemKey in keyof Value]: ItemKey extends number
		? ItemKey
		: ItemKey extends `${number}`
			? ItemKey
			: never;
}[keyof Value];

/**
 * The numerical values of an object
 */
export type NumericalValues<Item extends PlainObject> = {
	[ItemKey in keyof Item as Item[ItemKey] extends number ? ItemKey : never]: Item[ItemKey];
};

/**
 * An asynchronous function that can only be called once, returning the same value on subsequent calls
 */
export type OnceAsyncCallback<Callback extends GenericAsyncCallback> = {
	/**
	 * Did the callback's promise reject?
	 */
	readonly error: boolean;
	/**
	 * Has the callback finished?
	 */
	readonly finished: boolean;
} & Callback &
	OnceCallbackProperties;

/**
 * A callback function that can only be called once, returning the same value on subsequent calls
 */
export type OnceCallback<Callback extends GenericCallback> = Callback & OnceCallbackProperties;

type OnceCallbackProperties = {
	/**
	 * Has the callback been called?
	 */
	readonly called: boolean;
	/**
	 * Has the callback's value been cleared?
	 */
	readonly cleared: boolean;
	/**
	 * Clear the callback's cached value
	 */
	clear: () => void;
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
export type Simplify<Value> = {[ValueKey in keyof Value]: Value[ValueKey]} & {};

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
