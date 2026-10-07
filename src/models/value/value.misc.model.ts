import type {
	NestedKeys,
	NestedValue,
	PlainObject,
	Simplify,
	ToString,
	UnionToIntersection,
} from '../index';

// #region Types

export type ComparisonHandler<Value = any> = (first: Value, second: Value) => number;

/**
 * Thanks, type-fest!
 */
type KeysOfUnion<ObjectType> = keyof UnionToIntersection<
	ObjectType extends unknown ? Record<keyof ObjectType, never> : never
>;

/**
 * A shaken object, without any `undefined` values
 */
export type Shaken<Value extends PlainObject> = Simplify<
	{
		[Key in keyof Value as undefined extends Value[Key] ? never : Key]: Value[Key];
	} & {
		[
			Key in keyof Value as undefined extends Value[Key]
				? [Value[Key]] extends [undefined]
					? never
					: Key
				: never
		]?: Exclude<Value[Key], undefined>;
	}
>;

/**
 * A smushed object, with all nested objects flattened into a single level, using dot notation keys
 */
export type Smushed<Value extends PlainObject> = Simplify<{
	[NestedKey in NestedKeys<Value>]: NestedValue<Value, ToString<NestedKey>>;
}>;

/**
 * An unsmushed object, with all dot notation keys turned into nested keys
 */
export type Unsmushed<Value extends PlainObject> = Simplify<
	Omit<
		{
			[UnionKey in KeysOfUnion<Value>]: Value[UnionKey];
		},
		`${string}.${string}`
	>
>;

export type UnsmushedKey = {
	order: number;
	value: string;
};

// #endregion

// #region Variables

export const COMPARE_NAME: string = 'compare';

export const VALUE_MISC_EXPRESSION_BRACKET: RegExp = /\[(\w+)\]/g;

export const VALUE_MISC_EXPRESSION_DOTS: RegExp = /^\.|\.$/g;

export const VALUE_MISC_EXPRESSION_NESTED: RegExp = /\.|\[\w+\]/;

export const VALUE_MISC_NESTED_MESSAGE_INPUT = 'Expected data to be an object';

export const VALUE_MISC_NESTED_MESSAGE_MISSING = 'Expected property to exist in object';

export const VALUE_MISC_NESTED_MESSAGE_PATH = 'Expected path to be a string';

export const VALUE_MISC_NESTED_MESSAGE_UNSAFE = 'Access to this property is not allowed';

export const SMUSH_MAX_DEPTH = 100;

// #endregion
