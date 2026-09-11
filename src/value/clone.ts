import {isArrayOrPlainObject, isTypedArray} from '../internal/is';
import {createValueHandler} from '../internal/value/handlers';
import type {ArrayOrPlainObject, Constructor, PlainObject, TypedArray} from '../models';

// #region Special variables

const CLONE_NAME = 'clone';

// #endregion

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
};

type CloneParameters = {
	copy: boolean;
	options: Required<CloneOptions>;
	references: WeakMap<WeakKey, unknown>;
};

/**
 * A cloning function with predefined options
 */
export type Cloner = {
	/**
	 * Clone any kind of value
	 *
	 * @param value Value to clone
	 * @returns Cloned value
	 */
	clone<Value>(value: Value): Value;

	/**
	 * Deregister a clone handler for a specific class
	 *
	 * _Available as `deregisterCloner` and `template.deregister`_
	 *
	 * @param constructor Class constructor
	 */
	deregister: typeof deregisterCloner;

	/**
	 * Register a clone handler for a specific class
	 *
	 * _Available as `registerCloner` and `template.register`_
	 *
	 * @param constructor Class constructor
	 * @param handler Method name or clone function _(defaults to method name `clone`)_
	 */
	register: typeof registerCloner;
};

type InternalCloner = {
	[CLONE_SYMBOL]: Required<CloneOptions>;
} & Cloner;

// #endregion

// #region Instances

function Cloner(this: any, options: Required<CloneOptions>) {
	Object.defineProperty(this, CLONE_SYMBOL, {
		value: options,
	});
}

Object.defineProperties(Cloner.prototype, {
	clone: {
		value: cloneFromCloner,
	},
	deregister: {
		value: deregisterCloner,
	},
	register: {
		value: registerCloner,
	},
});

// #endregion

// #region Functions

/**
 * Clone any kind of value _(deeply, if needed)_
 *
 * @param value Value to clone
 * @param options Clone options
 * @returns Cloned value
 */
export function clone<Value>(value: Value, options?: CloneOptions): Value;

export function clone(value: unknown, options?: unknown): unknown {
	return cloneAny(value, {copy: false} as CloneParameters, 0, options);
}

function cloneAny(
	value: unknown,
	parameters: CloneParameters,
	depth: number,
	options?: unknown,
): unknown {
	switch (true) {
		case value === null || CLONE_PRIMITIVES[typeof value as string]:
			return value;

		case value instanceof Date:
			return new Date(value.getTime());

		case typeof value === 'function': {
			parameters.options ??= createCloneOptions(options);

			return parameters.options.copyFunctions ? value : undefined;
		}

		case typeof value === 'symbol': {
			parameters.options ??= createCloneOptions(options);

			return parameters.options.copySymbols ? value : Symbol(value.description);
		}

		default:
			break;
	}

	parameters.options ??= createCloneOptions(options);
	parameters.references ??= new WeakMap();

	switch (true) {
		case parameters.references.has(value as object):
			return parameters.references!.get(value as object);

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
			return parameters.copy ? value : clone.handlers.handle(value, parameters, depth);
	}
}

function cloneArrayBuffer(
	value: ArrayBuffer,
	parameters: CloneParameters,
	depth: number,
): ArrayBuffer {
	if (parameters.copy || depth >= CLONE_MAX_DEPTH) {
		return value;
	}

	const cloned = new ArrayBuffer(value.byteLength);

	new Uint8Array(cloned).set(new Uint8Array(value));

	parameters.references.set(value, cloned);

	return cloned;
}

function cloneDataView(value: DataView, parameters: CloneParameters, depth: number): DataView {
	if (parameters.copy || depth >= CLONE_MAX_DEPTH) {
		return value;
	}

	const buffer = cloneArrayBuffer(value.buffer as ArrayBuffer, parameters, depth);

	const cloned = new DataView(buffer, value.byteOffset, value.byteLength);

	parameters.references.set(value, cloned);

	return cloned;
}

function cloneFromCloner(this: Cloner, value: unknown): unknown {
	return cloneAny(
		value,
		{
			copy: false,
			options: (this as InternalCloner)[CLONE_SYMBOL],
		} as CloneParameters,
		0,
	);
}

function cloneMap(
	map: Map<unknown, unknown>,
	parameters: CloneParameters,
	depth: number,
): Map<unknown, unknown> {
	if (depth >= CLONE_MAX_DEPTH) {
		return map;
	}

	if (parameters.copy) {
		return new Map(map);
	}

	const cloned = new Map<unknown, unknown>();

	for (const [key, value] of map.entries()) {
		cloned.set(cloneAny(key, parameters, depth + 1), cloneAny(value, parameters, depth + 1));
	}

	parameters.references.set(map, cloned);

	return cloned;
}

function cloneNode(node: Node, parameters: CloneParameters, depth: number): Node {
	if (parameters.copy || depth >= CLONE_MAX_DEPTH) {
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
	if (depth >= CLONE_MAX_DEPTH) {
		return value;
	}

	const isArray = Array.isArray(value);

	if (parameters.copy) {
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
	if (parameters.copy || depth >= CLONE_MAX_DEPTH) {
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

	if (parameters.copy) {
		return new Set(set);
	}

	const cloned = new Set<unknown>();

	for (const value of set.values()) {
		cloned.add(cloneAny(value, parameters, depth + 1));
	}

	parameters.references.set(set, cloned);

	return cloned;
}

function cloneTypedArray(
	value: TypedArray,
	parameters: CloneParameters,
	depth: number,
): TypedArray {
	if (parameters.copy || depth >= CLONE_MAX_DEPTH) {
		return value;
	}

	const cloned = new (value.constructor as new (...args: unknown[]) => TypedArray)(value);

	parameters.references.set(value, cloned);

	return cloned as TypedArray;
}

/**
 * Copy any kind of value
 *
 * - Copies the value shallowly _(if possible)_, without copying or cloning nested values
 * - To copy a value deeply, use `clone` instead
 *
 * @param value Value to copy
 * @returns Copied value
 */
export function copy<Value>(value: Value): Value;

export function copy(value: unknown): unknown {
	return cloneAny(
		value,
		{
			copy: true,
			options: CLONE_COPY_OPTIONS,
			references: undefined as never,
		},
		0,
	);
}

function createCloneOptions(input?: unknown): Required<CloneOptions> {
	if (typeof input !== 'object' || input === null) {
		return CLONE_DEFAULT_OPTIONS;
	}

	return {
		copyFunctions: (input as PlainObject).copyFunctions === true,
		copySymbols: (input as PlainObject).copySymbols === true,
	};
}

/**
 * Deregister a clone handler for a specific class
 *
 * _Available as `deregisterCloner` and `template.deregister`_
 *
 * @param constructor Class constructor
 */
export function deregisterCloner<Instance>(constructor: Constructor<Instance>): void {
	cloneHandler.base.deregister(constructor);
}

/**
 * Create a cloner with predefined options
 *
 * _Available as `initializeCloner` and `clone.initialize`_
 *
 * @param options Clone options
 * @returns Cloner function
 */
export function initializeCloner(options?: CloneOptions): Cloner {
	// @ts-expect-error All good, no worries :-)
	return new Cloner(createCloneOptions(options));
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
	cloneHandler.base.register(constructor, handler);
}

function tryStructuredClone(value: object, parameters: CloneParameters, depth: number): unknown {
	if (depth >= CLONE_MAX_DEPTH) {
		return value;
	}

	try {
		const cloned = structuredClone(value);

		parameters.references.set(value, cloned);

		return cloned;
	} catch {
		parameters.references.set(value, value);

		return value;
	}
}

// #endregion

// #region Variables

const CLONE_COPY_OPTIONS: Required<CloneOptions> = {
	copyFunctions: true,
	copySymbols: true,
};

const CLONE_DEFAULT_OPTIONS: Required<CloneOptions> = {
	copyFunctions: false,
	copySymbols: false,
};

const CLONE_MAX_DEPTH = 100;

const cloneHandler = createValueHandler(clone, {
	callback: tryStructuredClone,
	method: CLONE_NAME,
});

const CLONE_PRIMITIVES: Record<string, boolean> = {
	bigint: true,
	boolean: true,
	function: false,
	number: true,
	object: false,
	string: true,
	symbol: false,
	undefined: true,
};

const CLONE_SYMBOL = Symbol(CLONE_NAME);

// #endregion

// #Initialization

clone.deregister = deregisterCloner;
clone.handlers = cloneHandler;
clone.initialize = initializeCloner;
clone.register = registerCloner;

Object.defineProperties(clone, {
	deregister: {
		value: deregisterCloner,
	},
	handler: {
		value: cloneHandler,
	},
	initialize: {
		value: initializeCloner,
	},
	register: {
		value: registerCloner,
	},
});

// #endregion
