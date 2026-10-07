import type {Constructor} from '../index';

// #region Types

/**
 * Options for value equality comparison
 */
export type EqualOptions = {
	/**
	 * When `true`, strings are compared case-insensitively
	 */
	ignoreCase?: boolean;
	/**
	 * Keys _(or key expressions)_ to ignore when comparing objects
	 */
	ignoreKeys?: string | RegExp | Array<string | RegExp>;
	/**
	 * Should `null` and `undefined` be considered equal?
	 */
	relaxedNullish?: boolean;
};

/**
 * An equalizer function for comparing values for equality, with predefined options
 *
 * Can be used to compare values, and register or deregister equality comparison handlers for specific classes
 */
export type Equalizer = {
	/**
	 * Are two strings equal?
	 *
	 * @param first First string
	 * @param second Second string
	 * @param ignoreCase If `true`, comparison will be case-insensitive
	 * @returns `true` if the strings are equal, otherwise `false`
	 */
	compare(first: string, second: string, ignoreCase?: boolean): boolean;

	/**
	 * Are two values equal?
	 *
	 * @param first First value
	 * @param second Second value
	 * @returns `true` if the values are equal, otherwise `false`
	 */
	compare(first: unknown, second: unknown): boolean;

	/**
	 * Deregister a equality comparison handler for a specific class
	 *
	 * @param constructor Class constructor
	 */
	deregister: <Instance>(constructor: Constructor<Instance>) => void;

	/**
	 * Register a equality comparison function for a specific class
	 *
	 * @param constructor Class constructor
	 * @param handler Comparison function
	 */
	register: <Instance>(
		constructor: Constructor<Instance>,
		handler: (first: Instance, second: Instance) => boolean,
	) => void;
};

export type InternalEqualizer = {
	[EQUAL_SYMBOL]: EqualizerOptions;
} & Equalizer;

export type EqualizerOptions = {
	ignoreCase: boolean;
	ignoreExpressions: EqualizerOptionsKeys<RegExp[]>;
	ignoreKeys: EqualizerOptionsKeys<Set<string>>;
	relaxedNullish: boolean;
};

type EqualizerOptionsKeys<Values> = {
	enabled: boolean;
	values: Values;
};

// #endregion

// #region Variables

export const EQUAL_ARRAY_PEEK_PERCENTAGE = 10;

export const EQUAL_ARRAY_THRESHOLD = 100;

export const EQUAL_ERROR_PROPERTIES: string[] = ['name', 'message'];

export const EQUAL_EXPRESSION_PROPERTIES: string[] = ['source', 'flags'];

export const EQUAL_MINIMUM_LENGTH_FOR_SET = 16;

export const EQUAL_SYMBOL: unique symbol = Symbol('equal');

// #endregion
