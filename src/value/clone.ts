import {isArrayOrPlainObject, isTypedArray} from '../internal/is';
import {getSelfHandlers} from '../internal/value/handlers';
import type {ArrayOrPlainObject, Constructor, PlainObject, TypedArray} from '../models';

// #region Types

export type CloneOptions = {
	/**
	 * Copy functions instead of returning `undefined`? _(defaults to `false`)_
	 */
	copyFunctions?: boolean;
	/**
	 * Copy symbols instead of returning `Symbol(description)`? _(defaults to `false`)_
	 */
	copySymbols?: boolean;
	/**
	 * Clone only the value itself, without cloning nested values? _(defaults to `false`)_
	 */
	flat?: boolean;
};

type CloneParameters = {
	options: Required<CloneOptions>;
	references: WeakMap<WeakKey, unknown>;
};

// #endregion

// #region Special variables

const CLONE_NAME = 'clone';

// #endregion

// #region Functions

/**
 * Clone any kind of value _(shallowly)_
 *
 * @param value Value to clone
 * @param flat Clone only the value itself, without cloning nested values
 * @returns Cloned value
 */
export function clone<Value>(value: Value, flat: true): Value;

/**
 * Clone any kind of value _(deeply, if needed)_
 *
 * @param value Value to clone
 * @param options Clone options
 * @returns Cloned value
 */
export function clone<Value>(value: Value, options?: CloneOptions): Value;

export function clone(value: unknown, options?: unknown): unknown {
	switch (true) {
		case value === null:
		case value === undefined:
		case typeof value === 'bigint':
		case typeof value === 'boolean':
		case typeof value === 'number':
		case typeof value === 'string':
			return value;

		case value instanceof Date:
			return new Date(value.getTime());

		default:
			return cloneAny(value, getCloneParameters(options), 0);
	}
}

clone.handlers = getSelfHandlers(clone, {
	callback: tryStructuredClone,
	method: CLONE_NAME,
});

clone.deregister = deregisterCloner;
clone.register = registerCloner;

function cloneAny(value: unknown, parameters: CloneParameters, depth: number): unknown {
	switch (true) {
		case value == null:
		case typeof value === 'bigint':
		case typeof value === 'boolean':
		case typeof value === 'number':
		case typeof value === 'string':
			return value;

		case value instanceof Date:
			return new Date(value.getTime());

		case typeof value === 'function':
			return parameters.options?.copyFunctions ? value : undefined;

		case typeof value === 'symbol':
			return parameters.options?.copySymbols ? value : Symbol(value.description);

		case parameters.references.has(value as object):
			return parameters.references!.get(value);

		case value instanceof ArrayBuffer:
			return cloneArrayBuffer(value, parameters, depth);

		case value instanceof DataView:
			return cloneDataView(value, parameters, depth);

		case value instanceof RegExp:
			return cloneRegularExpression(value, parameters, depth);

		case value instanceof Map:
			return cloneMap(value, parameters, depth);

		case typeof Node !== 'undefined' && value instanceof Node:
			return cloneNode(value, parameters, depth);

		case value instanceof Set:
			return cloneSet(value, parameters, depth);

		case isArrayOrPlainObject(value):
			return cloneObject(value, parameters, depth);

		case isTypedArray(value):
			return cloneTypedArray(value, parameters, depth);

		default:
			return clone.handlers.handle(value, parameters, depth);
	}
}

function cloneArrayBuffer(
	value: ArrayBuffer,
	parameters: CloneParameters,
	depth: number,
): ArrayBuffer {
	if (depth >= CLONE_MAX_DEPTH) {
		return value;
	}

	const cloned = new ArrayBuffer(value.byteLength);

	new Uint8Array(cloned).set(new Uint8Array(value));

	parameters.references.set(value, cloned);

	return cloned;
}

function cloneDataView(value: DataView, parameters: CloneParameters, depth: number): DataView {
	if (depth >= CLONE_MAX_DEPTH) {
		return value;
	}

	const buffer = cloneArrayBuffer(value.buffer as ArrayBuffer, parameters, depth);

	const cloned = new DataView(buffer, value.byteOffset, value.byteLength);

	parameters.references.set(value, cloned);

	return cloned;
}

function cloneMap(
	map: Map<unknown, unknown>,
	parameters: CloneParameters,
	depth: number,
): Map<unknown, unknown> {
	if (depth >= CLONE_MAX_DEPTH) {
		return map;
	}

	const flat = parameters.options?.flat;

	const cloned = new Map<unknown, unknown>();
	const entries = map.entries();

	for (const entry of entries) {
		cloned.set(
			flat ? entry[0] : cloneAny(entry[0], parameters, depth + 1),
			flat ? entry[1] : cloneAny(entry[1], parameters, depth + 1),
		);
	}

	parameters.references.set(map, cloned);

	return cloned;
}

function cloneNode(node: Node, parameters: CloneParameters, depth: number): Node {
	if (depth >= CLONE_MAX_DEPTH) {
		return node;
	}

	const cloned = node.cloneNode(true);

	parameters.references.set(node, cloned);

	return cloned;
}

function cloneObject(
	value: ArrayOrPlainObject,
	parameters: CloneParameters,
	depth: number,
): ArrayOrPlainObject {
	const isArray = Array.isArray(value);

	if (parameters.options?.flat || depth >= CLONE_MAX_DEPTH) {
		return isArray ? value.slice() : {...value};
	}

	const cloned = (isArray ? [] : {}) as PlainObject;
	const keys = isArray ? undefined : Object.keys(value);
	const {length} = keys ?? (value as unknown[]);

	for (let index = 0; index < length; index += 1) {
		const key = keys?.[index] ?? index;

		cloned[key] = cloneAny((value as PlainObject)[key], parameters, depth + 1);
	}

	parameters.references.set(value, cloned);

	return cloned;
}

function cloneRegularExpression(value: RegExp, parameters: CloneParameters, depth: number): RegExp {
	if (depth >= CLONE_MAX_DEPTH) {
		return value;
	}

	const cloned = new RegExp(value.source, value.flags);

	cloned.lastIndex = value.lastIndex;

	parameters.references.set(value, cloned);

	return cloned;
}

function cloneSet(set: Set<unknown>, parameters: CloneParameters, depth: number): Set<unknown> {
	if (depth >= CLONE_MAX_DEPTH) {
		return set;
	}

	const cloned = new Set<unknown>();
	const values = [...set.values()];
	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		cloned.add(
			parameters.options?.flat ? values[index] : cloneAny(values[index], parameters, depth + 1),
		);
	}

	parameters.references.set(set, cloned);

	return cloned;
}

function cloneTypedArray(
	value: TypedArray,
	parameters: CloneParameters,
	depth: number,
): TypedArray {
	if (depth >= CLONE_MAX_DEPTH) {
		return value;
	}

	const cloned = new (value.constructor as new (...args: unknown[]) => TypedArray)(value);

	parameters.references.set(value, cloned);

	return cloned as TypedArray;
}

/**
 * Copy any kind of value
 *
 * - Clones the value shallowly, without cloning nested values
 * - To copy a value deeply, use `clone` instead
 *
 * @param value Value to copy
 * @returns Copied value
 */
export function copy<Value>(value: Value): Value {
	return clone(value, CLONE_COPY_OPTIONS) as Value;
}

/**
 * Deregister a clone handler for a specific class
 *
 * _Available as `deregisterCloner` and `template.deregister`_
 *
 * @param constructor Class constructor
 */
export function deregisterCloner<Instance>(constructor: Constructor<Instance>): void {
	clone.handlers.deregister(constructor);
}

function getCloneOptions(input?: unknown): Required<CloneOptions> {
	if (typeof input === 'boolean') {
		return {
			copyFunctions: false,
			copySymbols: false,
			flat: input === true,
		};
	}

	if (typeof input !== 'object' || input === null) {
		return CLONE_DEFAULT_OPTIONS;
	}

	return {
		copyFunctions: (input as PlainObject).copyFunctions === true,
		copySymbols: (input as PlainObject).copySymbols === true,
		flat: (input as PlainObject).flat === true,
	};
}

function getCloneParameters(input?: unknown): CloneParameters {
	return {
		options: getCloneOptions(input),
		references: new WeakMap(),
	};
}

/**
 * Register a clone handler for a specific class
 *
 * _Available as `registerCloner` and `template.register`_
 *
 * @param constructor Class constructor
 * @param handler Method name or clone function _(defaults to method name `clone`)_
 */
export function registerCloner<Instance>(
	constructor: Constructor<Instance>,
	handler?: string | ((value: Instance) => Instance),
): void {
	clone.handlers.register(constructor, handler);
}

function tryStructuredClone(value: object, parameters: CloneParameters, depth: number): unknown {
	if (depth >= CLONE_MAX_DEPTH) {
		return value;
	}

	try {
		const cloned = structuredClone(value);

		parameters.references?.set(value, cloned);

		return cloned;
	} catch {
		parameters.references?.set(value, value);

		return value;
	}
}

// #endregion

// #region Variables

const CLONE_COPY_OPTIONS: Required<CloneOptions> = {
	copyFunctions: true,
	copySymbols: true,
	flat: true,
};

const CLONE_DEFAULT_OPTIONS: Required<CloneOptions> = {
	copyFunctions: false,
	copySymbols: false,
	flat: false,
};

const CLONE_MAX_DEPTH = 100;

// #endregion
