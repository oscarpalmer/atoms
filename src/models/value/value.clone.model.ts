import type {Constructor} from '../index';

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

export type CloneParameters = {
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
	deregister<Instance>(constructor: Constructor<Instance>): void;

	/**
	 * Register a clone handler for a specific class
	 *
	 * _Available as `registerCloner` and `template.register`_
	 *
	 * @param constructor Class constructor
	 * @param handler Method name or clone function _(defaults to method name `clone`)_
	 */
	register<Instance>(
		constructor: Constructor<Instance>,
		handler?: string | ((value: Instance) => Instance),
	): void;
};

export type InternalCloner = {
	[CLONE_SYMBOL]: Required<CloneOptions>;
} & Cloner;

// #endregion

// #region Variables

export const CLONE_NAME = 'clone';

export const CLONE_COPY_OPTIONS: Required<CloneOptions> = {
	copyFunctions: true,
	copySymbols: true,
};

export const CLONE_DEFAULT_OPTIONS: Required<CloneOptions> = {
	copyFunctions: false,
	copySymbols: false,
};

export const CLONE_MAX_DEPTH = 100;

export const CLONE_PRIMITIVES: Record<string, boolean> = {
	bigint: true,
	boolean: true,
	function: false,
	number: true,
	object: false,
	string: true,
	symbol: false,
	undefined: true,
};

export const CLONE_SYMBOL: unique symbol = Symbol(CLONE_NAME);

// #endregion
