import type {KeysOfUnion, Simplify} from 'type-fest';
import {isArrayOrPlainObject} from '../internal/is';
import {setValue} from '../internal/value/set';
import type {PlainObject} from '../models';

type OrderedKey = {
	order: number;
	value: string;
};

type Unsmushed<Value extends PlainObject> = Simplify<
	Omit<
		{
			[Key in KeysOfUnion<Value>]: Value[Key];
		},
		`${string}.${string}`
	>
>;

function getKeys(value: PlainObject): OrderedKey[] {
	const keys = Object.keys(value);
	const {length} = keys;

	const result: OrderedKey[] = [];

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		result.push({
			order: key.split('.').length,
			value: key,
		});
	}

	return result.sort((first, second) => first.order - second.order);
}

/**
 * Unsmush a smushed object _(turning dot notation keys into nested keys)_
 * @param value Object to unsmush
 * @returns Unsmushed object with nested keys
 */
export function unsmush<Value extends PlainObject>(
	value: Value,
): Unsmushed<Value> {
	if (typeof value !== 'object' || value === null) {
		return {} as never;
	}

	const keys = getKeys(value);
	const {length} = keys;
	const unsmushed: PlainObject = {};

	for (let index = 0; index < length; index += 1) {
		const key = keys[index].value;
		const val = value[key];

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

	return unsmushed as never;
}
