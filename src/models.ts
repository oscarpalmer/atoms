import type {Get, Paths, Primitive} from 'type-fest';

/**
 * A generic array or object
 */
export type ArrayOrPlainObject = unknown[] | Record<PropertyKey, unknown>;

export type EventPosition = {
	x: number;
	y: number;
};

// biome-ignore lint/suspicious/noExplicitAny: It's meant to be generic and permissive, so `any`is fine
export type GenericCallback = (...args: any[]) => any;

/**
 * A useful key type
 */
export type Key = number | string;

export type KeyedValue<
	Item,
	Key extends keyof Item,
> = Item[Key] extends PropertyKey ? Item[Key] : never;

export type NestedArray<Value> = Value extends Array<infer NestedValue>
	? NestedArray<NestedValue>
	: Value;

export type NestedPartial<T> = {
	[K in keyof T]?: T[K] extends object ? NestedPartial<T[K]> : T[K];
};

/**
 * A generic object
 */
export type PlainObject = Record<PropertyKey, unknown>;

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

export type {Get, Paths, Primitive};
