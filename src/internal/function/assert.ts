import {
	ASSERT_MESSAGE_VALUE_DEFINED,
	type Asserter,
	type AssertNestedPick,
} from '../../models/function/assert.model';
import type {Constructor, NestedKeys, NestedValue, PlainObject} from '../../models/index';
import {hasValueResult} from '../value/has';

// #region Functions

/**
 * Asserts that a condition is true, throwing an error if it is not
 *
 * @param condition Condition to assert
 * @param message Error message
 * @param error Error constructor _(defaults to `Error`)_
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

/**
 * Creates an _Asserter_ that asserts a condition is true, throwing an error if it is not
 *
 * _Available as `assertCondition` and `assert.condition`_
 *
 * @param condition Condition to assert
 * @param message Error message
 * @param error Error constructor _(defaults to `Error`)_
 * @returns _Asserter_
 */
export function assertCondition<Value>(
	condition: (value: unknown) => boolean,
	message: string,
	error?: ErrorConstructor,
): Asserter<Value> {
	return value => {
		assert(() => condition(value), message, error);
	};
}

/**
 * Asserts that a value is defined, throwing an error if it is not
 *
 * _Available as `assertDefined` and `assert.defined`_
 *
 * @param value Value to assert
 * @param message Error message
 * @param error Error constructor _(defaults to `Error`)_
 */
export function assertDefined<Value>(
	value: unknown,
	message?: string,
	error?: ErrorConstructor,
): asserts value is Exclude<Value, null | undefined> {
	assert(() => value != null, message ?? ASSERT_MESSAGE_VALUE_DEFINED, error);
}

/**
 * Creates an _Asserter_ that asserts a value is an instance of a constructor, throwing an error if it is not
 *
 * _Available as `assertInstanceOf` and `assert.instanceOf`_
 *
 * @param constructor Constructor to check against
 * @param message Error message
 * @param error Error constructor _(defaults to `Error`)_
 * @returns _Asserter_
 */
export function assertInstanceOf<Value>(
	constructor: Constructor<Value>,
	message: string,
	error?: ErrorConstructor,
): Asserter<Value> {
	return value => {
		assert(() => value instanceof constructor, message, error);
	};
}

/**
 * Creates an _Asserter_ that asserts a value is of a specific type, throwing an error if it is not
 *
 * _Available as `assertIs` and `assert.is`_
 *
 * @param condition Type guard function to check the value
 * @param message Error message
 * @param error Error constructor _(defaults to `Error`)_
 * @returns _Asserter_
 */
export function assertIs<Value>(
	condition: (value: unknown) => value is Value,
	message: string,
	error?: ErrorConstructor,
): Asserter<Value> {
	return value => {
		assert(() => condition(value), message, error);
	};
}

/**
 * Creates an _Asserter_ that asserts a property of a value exists and satisfies a condition, throwing an error if it does not
 *
 * _Available as `assertProperty` and `assert.property`_
 *
 * @param path Path to the property to check, e.g., `foo.bar.baz` for a nested property
 * @param condition Condition to assert for the property
 * @param message Error message
 * @param error Error constructor _(defaults to `Error`)_
 * @returns _Asserter_
 */
export function assertProperty<Value extends PlainObject, Path extends NestedKeys<Value>>(
	path: Path,
	condition: (value: NestedValue<Value, Path>) => boolean,
	message: string,
	error?: ErrorConstructor,
): Asserter<AssertNestedPick<Value, Path>> {
	return (value: unknown): asserts value is unknown => {
		assert(
			() => {
				const result = hasValueResult(value as never, path, false);

				return result.ok && condition(result.value as never);
			},
			message,
			error,
		);
	};
}

// #endregion

// #region Namespace

export declare namespace assert {
	export var condition: typeof assertCondition;
	export var defined: typeof assertDefined;
	export var instanceOf: typeof assertInstanceOf;
	export var is: typeof assertIs;
	export var property: typeof assertProperty;
}

// #endregion

// #region Initialization

assert.condition = assertCondition;
assert.defined = assertDefined;
assert.instanceOf = assertInstanceOf;
assert.is = assertIs;
assert.property = assertProperty;

// #endregion

// #region Exports

export type {Asserter};

// #endregion
