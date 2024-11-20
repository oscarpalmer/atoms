import type {KeysOfUnion, Simplify} from 'type-fest';
import {isArrayOrPlainObject} from '../is';
import type {PlainObject} from '../models';
import {setValue} from '../value/set';

type Unsmushed<Value extends PlainObject> = Simplify<
	Omit<
		{
			[Key in KeysOfUnion<Value>]: Value[Key];
		},
		`${string}.${string}`
	>
>;

function getKeyGroups(value: PlainObject): string[][] {
	const keys = Object.keys(value);
	const {length} = keys;
	const grouped: string[][] = [];

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const dots = key.split('.');

		if (grouped[dots.length] == null) {
			grouped[dots.length] = [key];
		} else {
			grouped[dots.length].push(key);
		}
	}

	return grouped;
}

/**
 * Unsmush a smushed object _(turning dot notation keys into nested keys)_
 */
export function unsmush<Value extends PlainObject>(
	value: Value,
): Unsmushed<Value> {
	const groups = getKeyGroups(value);
	const {length} = groups;
	const unsmushed: PlainObject = {};

	for (let groupIndex = 1; groupIndex < length; groupIndex += 1) {
		const group = groups[groupIndex];
		const groupLength = group.length;

		for (let keyIndex = 0; keyIndex < groupLength; keyIndex += 1) {
			const key = group[keyIndex];
			const val = value[key as never];

			setValue(
				unsmushed,
				key,
				isArrayOrPlainObject(val)
					? Array.isArray(val)
						? [...val]
						: {...val}
					: val,
			);
		}
	}

	return unsmushed as never;
}
