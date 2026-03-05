import type {Constructor} from '../models';

// #region Types

export type Asserter<Value> = (value: unknown) => asserts value is Value;

// #endregion

// #region Functions

/**
 * Asserts that a condition is true, throwing an error if it is not
 * @param condition Condition to assert
 * @param message Error message
 * @param error Error constructor
 */
export function assert<Condition extends () => boolean>(
	condition: Condition,
	message: string,
	error?: ErrorConstructor,
): asserts condition {
	if (!condition()) {
		throw new (error ?? Error)(message);
	}
}

assert.condition = assertCondition;
assert.defined = assertDefined;
assert.instanceOf = assertInstanceOf;
assert.is = assertIs;

/**
 * Creates an asserter that asserts a condition is true, throwing an error if it is not
 * @param condition Condition to assert
 * @param message Error message
 * @param error Error constructor
 * @returns Asserter
 */
function assertCondition<Value>(
	condition: (value: unknown) => boolean,
	message: string,
	error?: ErrorConstructor,
): Asserter<Value> {
	return value => {
		assert(() => condition(value), message, error);
	};
}

/**
 * Asserts that a value is defined throwing an error if it is not
 * @param value Value to assert
 * @param message Error message
 */
function assertDefined<Value>(
	value: unknown,
	message?: string,
): asserts value is Exclude<Value, null | undefined> {
	assert(() => value != null, message ?? MESSAGE_VALUE_DEFINED);
}

/**
 * Creates an asserter that asserts a value is an instance of a constructor, throwing an error if it is not
 * @param constructor Constructor to check against
 * @param message Error message
 * @param error Error constructor
 * @returns Asserter
 */
function assertInstanceOf<Value>(
	constructor: Constructor<Value>,
	message: string,
	error?: ErrorConstructor,
): Asserter<Value> {
	return value => {
		assert(() => value instanceof constructor, message, error);
	};
}

/**
 * Creates an asserter that asserts a value is of a specific type, throwing an error if it is not
 * @param condition Type guard function to check the value
 * @param message Error message
 * @param error Error constructor
 * @returns Asserter
 */
function assertIs<Value>(
	condition: (value: unknown) => value is Value,
	message: string,
	error?: ErrorConstructor,
): Asserter<Value> {
	return value => {
		assert(() => condition(value), message, error);
	};
}

// #endregion

// #region Variables

const MESSAGE_VALUE_DEFINED = 'Expected value to be defined';

// #endregion
