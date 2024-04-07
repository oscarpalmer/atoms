import type {
	Get,
	Paths,
	Primitive,
	UnknownArray,
	UnknownRecord,
} from 'type-fest';

export type ArrayOrPlainObject = UnknownArray | UnknownRecord;

export type Key = number | string;

export type EventPosition = {
	x: number;
	y: number;
};

export type PlainObject = UnknownRecord;

export type UnknownArrayOrRecord = UnknownArray | UnknownRecord;

export type {Get, Paths, Primitive, UnknownArray, UnknownRecord};
