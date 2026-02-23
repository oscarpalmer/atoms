import {isArrayOrPlainObject} from '../internal/is';
import {setValue} from '../internal/value/set';
import type {PlainObject, Simplify} from '../models';

// #region Types

/**
 * Thanks, type-fest!
 */
type KeysOfUnion<ObjectType> = keyof UnionToIntersection<
	ObjectType extends unknown ? Record<keyof ObjectType, never> : never
>;

type OrderedKey = {
	order: number;
	value: string;
};

/**
 * Thanks, type-fest!
 */
type UnionToIntersection<Union> = (
	Union extends unknown ? (distributedUnion: Union) => void : never
) extends (mergedIntersection: infer Intersection) => void
	? Intersection & Union
	: never;

export type Unsmushed<Value extends PlainObject> = Simplify<
	Omit<
		{
			[Key in KeysOfUnion<Value>]: Value[Key];
		},
		`${string}.${string}`
	>
>;

// #endregion

// #region Functions

function getKeys(value: PlainObject): OrderedKey[] {
	const keys = Object.keys(value);
	const {length} = keys;

	const orderedKeys: OrderedKey[] = [];

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		orderedKeys.push({
			order: key.split('.').length,
			value: key,
		});
	}

	return orderedKeys.sort((first, second) => first.order - second.order);
}

/**
 * Unsmush a smushed object _(turning dot notation keys into nested keys)_
 * @param value Object to unsmush
 * @returns Unsmushed object with nested keys
 */
export function unsmush<Value extends PlainObject>(value: Value): Unsmushed<Value> {
	if (typeof value !== 'object' || value === null) {
		return {} as never;
	}

	const keys = getKeys(value);
	const {length} = keys;
	const unsmushed: PlainObject = {};

	for (let index = 0; index < length; index += 1) {
		const key = keys[index].value;
		const val = value[key];

		let next = val;

		if (isArrayOrPlainObject(val)) {
			next = Array.isArray(val) ? [...val] : {...val};
		}

		setValue(unsmushed, key, next);
	}

	return unsmushed as never;
}

// #endregion
