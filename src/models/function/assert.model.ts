import type {NestedKeys, PlainObject} from '../index';

// #region Types

export type AssertNestedPick<Value, Path extends string> = Value extends PlainObject
	? Path extends `${infer Head}.${infer Rest}`
		? Head extends keyof Value
			? {[Key in Head]: AssertNestedPick<Value[Key], Rest>}
			: never
		: Path extends keyof Value
			? {[Key in Path]: Value[Key]}
			: never
	: never;

/**
 * Asserter for a property of a value
 */
export type AssertProperty<
	Value extends PlainObject,
	Path extends NestedKeys<Value>,
	Asserted extends AssertNestedPick<Value, Path> = AssertNestedPick<Value, Path>,
> = Asserter<Asserted>;

/**
 * A function that asserts a value is of a specific type, throwing an error if it is not
 */
export type Asserter<Value> = (value: unknown) => asserts value is Value;

// #endregion

// #region Variables

export const ASSERT_MESSAGE_VALUE_DEFINED = 'Expected value to be defined';

// #endregion
