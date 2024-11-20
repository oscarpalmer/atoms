import {isArrayOrPlainObject} from '../is';
import type {ArrayOrPlainObject, PlainObject} from '../models';

/**
 * Clone any kind of value _(deeply, if needed)_
 */
export function clone<Value>(value: Value): Value;

export function clone(value: unknown) {
	switch (true) {
		case value == null:
			return value;

		case typeof value === 'bigint':
			return BigInt(value);

		case typeof value === 'boolean':
			return Boolean(value);

		case typeof value === 'function':
			return undefined;

		case typeof value === 'number':
			return Number(value);

		case typeof value === 'string':
			return String(value);

		case typeof value === 'symbol':
			return Symbol(value.description);

		case value instanceof ArrayBuffer:
			return cloneArrayBuffer(value);

		case value instanceof DataView:
			return cloneDataView(value);

		case value instanceof Map:
		case value instanceof Set:
			return cloneMapOrSet(value);

		case value instanceof Node:
			return value.cloneNode(true);

		case value instanceof RegExp:
			return cloneRegularExpression(value);

		case isArrayOrPlainObject(value):
			return cloneObject(value as ArrayOrPlainObject);

		default:
			return structuredClone(value);
	}
}

function cloneArrayBuffer(value: ArrayBuffer): ArrayBuffer {
	const cloned = new ArrayBuffer(value.byteLength);

	new Uint8Array(cloned).set(new Uint8Array(value));

	return cloned;
}

function cloneDataView(value: DataView): DataView {
	const buffer = cloneArrayBuffer(value.buffer as ArrayBuffer);

	return new DataView(buffer, value.byteOffset, value.byteLength);
}

function cloneMapOrSet<Value extends Map<unknown, unknown> | Set<unknown>>(
	value: Value,
): Value {
	const isMap = value instanceof Map;
	const cloned = isMap ? new Map<unknown, unknown>() : new Set<unknown>();
	const entries = [...value.entries()];
	const {length} = entries;

	for (let index = 0; index < length; index += 1) {
		const entry = entries[index];

		if (isMap) {
			(cloned as Map<unknown, unknown>).set(clone(entry[0]), clone(entry[1]));
		} else {
			(cloned as Set<unknown>).add(clone(entry[0]));
		}
	}

	return cloned as Value;
}

function cloneObject(value: ArrayOrPlainObject): ArrayOrPlainObject {
	const cloned = (Array.isArray(value) ? [] : {}) as PlainObject;
	const keys = Object.keys(value);
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		cloned[key] = clone((value as PlainObject)[key]);
	}

	return cloned;
}

function cloneRegularExpression(value: RegExp): RegExp {
	const cloned = new RegExp(value.source, value.flags);

	cloned.lastIndex = value.lastIndex;

	return cloned;
}
