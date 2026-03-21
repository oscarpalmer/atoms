import {isArrayOrPlainObject, isTypedArray} from '../internal/is';
import {getSelfHandlers} from '../internal/value/handlers';
import type {ArrayOrPlainObject, Constructor, PlainObject, TypedArray} from '../models';

// #region Special variables

const CLONE_NAME = 'clone';

// #endregion

// #region Functions

/**
 * Clone any kind of value _(deeply, if needed)_
 * @param value Value to clone
 * @returns Cloned value
 */
export function clone<Value>(value: Value): Value;

export function clone(value: unknown): unknown {
	return cloneValue(value, 0, new WeakMap());
}

clone.handlers = getSelfHandlers(clone, {
	callback: tryStructuredClone,
	method: CLONE_NAME,
});

clone.register = registerCloner;

clone.unregister = unregisterCloner;

/**
 * Register a clone handler for a specific class
 * @param constructor Class constructor
 * @param handler Method name or clone function _(defaults to `clone`)_
 */
function registerCloner<Instance>(
	constructor: Constructor<Instance>,
	handler?: string | ((value: Instance) => Instance),
): void {
	clone.handlers.register(constructor, handler);
}

/**
 * Unregister a clone handler for a specific class
 * @param constructor Class constructor
 */
function unregisterCloner<Instance>(constructor: Constructor<Instance>): void {
	clone.handlers.unregister(constructor);
}

function cloneArrayBuffer(
	value: ArrayBuffer,
	depth?: number,
	references?: WeakMap<WeakKey, unknown>,
): ArrayBuffer {
	if (typeof depth === 'number' && depth >= MAX_CLONE_DEPTH) {
		return value;
	}

	const cloned = new ArrayBuffer(value.byteLength);

	new Uint8Array(cloned).set(new Uint8Array(value));

	references?.set(value, cloned);

	return cloned;
}

function cloneDataView(
	value: DataView,
	depth: number,
	references: WeakMap<WeakKey, unknown>,
): DataView {
	if (depth >= MAX_CLONE_DEPTH) {
		return value;
	}

	const buffer = cloneArrayBuffer(value.buffer as ArrayBuffer);

	const cloned = new DataView(buffer, value.byteOffset, value.byteLength);

	references.set(value, cloned);

	return cloned;
}

function cloneMap(
	map: Map<unknown, unknown>,
	depth: number,
	references: WeakMap<WeakKey, unknown>,
): Map<unknown, unknown> {
	if (depth >= MAX_CLONE_DEPTH) {
		return map;
	}

	const cloned = new Map<unknown, unknown>();
	const entries = map.entries();

	for (const entry of entries) {
		cloned.set(
			cloneValue(entry[0], depth + 1, references),
			cloneValue(entry[1], depth + 1, references),
		);
	}

	references.set(map, cloned);

	return cloned;
}

function cloneNode(node: Node, depth: number, references: WeakMap<WeakKey, unknown>): Node {
	if (depth >= MAX_CLONE_DEPTH) {
		return node;
	}

	const cloned = node.cloneNode(true);

	references.set(node, cloned);

	return cloned;
}

function clonePlainObject(
	value: ArrayOrPlainObject,
	depth: number,
	references: WeakMap<WeakKey, unknown>,
): ArrayOrPlainObject {
	if (depth >= MAX_CLONE_DEPTH) {
		return Array.isArray(value) ? value.slice() : {...value};
	}

	const cloned = (Array.isArray(value) ? [] : {}) as PlainObject;
	const keys = [...Object.keys(value), ...Object.getOwnPropertySymbols(value)];
	const {length} = keys;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		cloned[key] = cloneValue((value as PlainObject)[key], depth + 1, references);
	}

	references.set(value, cloned);

	return cloned;
}

function cloneRegularExpression(
	value: RegExp,
	depth: number,
	references: WeakMap<WeakKey, unknown>,
): RegExp {
	if (depth >= MAX_CLONE_DEPTH) {
		return value;
	}

	const cloned = new RegExp(value.source, value.flags);

	cloned.lastIndex = value.lastIndex;

	references.set(value, cloned);

	return cloned;
}

function cloneSet(
	set: Set<unknown>,
	depth: number,
	references: WeakMap<WeakKey, unknown>,
): Set<unknown> {
	if (depth >= MAX_CLONE_DEPTH) {
		return set;
	}

	const cloned = new Set<unknown>();
	const values = [...set.values()];
	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		cloned.add(cloneValue(values[index], depth + 1, references));
	}

	references.set(set, cloned);

	return cloned;
}

function cloneTypedArray(
	value: TypedArray,
	depth: number,
	references: WeakMap<WeakKey, unknown>,
): TypedArray {
	if (depth >= MAX_CLONE_DEPTH) {
		return value;
	}

	const cloned = new (value.constructor as new (...args: unknown[]) => TypedArray)(value);

	references.set(value, cloned);

	return cloned as TypedArray;
}

function cloneValue(value: unknown, depth: number, references: WeakMap<WeakKey, unknown>): unknown {
	switch (true) {
		case value == null:
			return value;

		case typeof value === 'bigint':
			return BigInt(value);

		case typeof value === 'boolean':
			return Boolean(value);

		case typeof value === 'function':
			return;

		case typeof value === 'number':
			return Number(value);

		case typeof value === 'string':
			return String(value);

		case typeof value === 'symbol':
			return Symbol(value.description);

		case references.has(value as object):
			return references.get(value);

		case value instanceof ArrayBuffer:
			return cloneArrayBuffer(value, depth, references);

		case value instanceof DataView:
			return cloneDataView(value, depth, references);

		case value instanceof Date:
			return new Date(value.getTime());

		case value instanceof RegExp:
			return cloneRegularExpression(value, depth, references);

		case value instanceof Map:
			return cloneMap(value, depth, references);

		case value instanceof Node:
			return cloneNode(value, depth, references);

		case value instanceof Set:
			return cloneSet(value, depth, references);

		case isArrayOrPlainObject(value):
			return clonePlainObject(value, depth, references);

		case isTypedArray(value):
			return cloneTypedArray(value, depth, references);

		default:
			return clone.handlers.handle(value, depth, references);
	}
}

function tryStructuredClone(
	value: object,
	depth: number,
	references: WeakMap<WeakKey, unknown>,
): unknown {
	if (depth >= MAX_CLONE_DEPTH) {
		return value;
	}

	try {
		const cloned = structuredClone(value);

		references.set(value, cloned);

		return cloned;
	} catch {
		references.set(value, value);

		return value;
	}
}

// #endregion

// #region Variables

const MAX_CLONE_DEPTH = 100;

// #endregion
