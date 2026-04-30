import {hasValueResult} from '../internal/value/has';
import type {Constructor, NestedKeys, NestedValue, PlainObject} from '../models';

// #region Types

/**
 * Asserter for a nested property of a value
 */
export type AssertProperty<
	Value extends PlainObject,
	Path extends NestedKeys<Value>,
	Asserted extends NestedPick<Value, Path> = NestedPick<Value, Path>,
> = Asserter<Asserted>;

/**
 * A function that asserts a value is of a specific type, throwing an error if it is not
 */
export type Asserter<Value> = (value: unknown) => asserts value is Value;

type NestedPick<Value, Path extends string> = Value extends PlainObject
	? Path extends `${infer Head}.${infer Rest}`
		? Head extends keyof Value
			? {[Key in Head]: NestedPick<Value[Key], Rest>}
			: never
		: Path extends keyof Value
			? {[Key in Path]: Value[Key]}
			: never
	: never;

// #endregion

// #region Functions

/**
 * Asserts that a condition is true, throwing an error if it is not
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

assert.condition = assertCondition;
assert.defined = assertDefined;
assert.instanceOf = assertInstanceOf;
assert.is = assertIs;
assert.property = assertProperty;

/**
 * Creates an asserter that asserts a condition is true, throwing an error if it is not
 *
 * Available as `assertCondition` and `assert.condition`
 * @param condition Condition to assert
 * @param message Error message
 * @param error Error constructor _(defaults to `Error`)_
 * @returns Asserter
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
 * Available as `assertDefined` and `assert.defined`
 * @param value Value to assert
 * @param message Error message
 * @param error Error constructor _(defaults to `Error`)_
 */
export function assertDefined<Value>(
	value: unknown,
	message?: string,
	error?: ErrorConstructor,
): asserts value is Exclude<Value, null | undefined> {
	assert(() => value != null, message ?? MESSAGE_VALUE_DEFINED, error);
}

/**
 * Creates an asserter that asserts a value is an instance of a constructor, throwing an error if it is not
 *
 * Available as `assertInstanceOf` and `assert.instanceOf`
 * @param constructor Constructor to check against
 * @param message Error message
 * @param error Error constructor _(defaults to `Error`)_
 * @returns Asserter
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
 * Creates an asserter that asserts a value is of a specific type, throwing an error if it is not
 *
 * Available as `assertIs` and `assert.is`
 * @param condition Type guard function to check the value
 * @param message Error message
 * @param error Error constructor _(defaults to `Error`)_
 * @returns Asserter
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
 * Creates an asserter that asserts a property of a value exists and satisfies a condition, throwing an error if it does not
 *
 * Available as `assertProperty` and `assert.property`
 * @param path Path to the property to check, e.g., `foo.bar.baz` for a nested property
 * @param condition Condition to assert for the property
 * @param message Error message
 * @param error Error constructor _(defaults to `Error`)_
 * @returns Asserter
 */
export function assertProperty<
	Value extends PlainObject,
	Path extends NestedKeys<Value>,
	Asserted = NestedPick<Value, Path>,
>(
	path: Path,
	condition: (value: NestedValue<Value, Path>) => boolean,
	message: string,
	error?: ErrorConstructor,
): Asserter<Asserted> {
	return (value: unknown): asserts value is Asserted => {
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

// #region Variables

const MESSAGE_VALUE_DEFINED = 'Expected value to be defined';

// #endregion
