import type {Get, Paths} from 'type-fest';

export type ArrayOrPlainObject = unknown[] | Record<PropertyKey, unknown>;

export type EventPosition = {
	x: number;
	y: number;
};

export type KeyedValue<
	Item,
	Key extends keyof Item,
> = Item[Key] extends PropertyKey ? Item[Key] : never;

export type NestedArrayType<Value> = Value extends Array<infer NestedValue>
	? NestedArrayType<NestedValue>
	: Value;

// biome-ignore lint/suspicious/noExplicitAny: It's meant to be generic and permissive, so `any`is fine
export type GenericCallback = (...args: any[]) => any;

export type Key = number | string;

export type PlainObject = Record<PropertyKey, unknown>;

export type Primitive =
	| bigint
	| boolean
	| null
	| number
	| string
	| symbol
	| undefined;

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

export type {Get, Paths};
