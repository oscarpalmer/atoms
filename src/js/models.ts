import type {
	Get,
	Paths,
	Primitive,
	UnknownArray,
	UnknownRecord,
} from 'type-fest';

export type ArrayOrPlainObject = UnknownArray | UnknownRecord;

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

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type GenericCallback = (...args: any[]) => any;

export type Key = number | string;

export type PlainObject = UnknownRecord;

export type UnknownArrayOrRecord = UnknownArray | UnknownRecord;

export type {Get, Paths, Primitive, UnknownArray, UnknownRecord};

