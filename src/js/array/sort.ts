import {isKey} from '../is';
import type {Key, PlainObject} from '../models';
import {compare} from '../value/compare';
import type {SortKey, SortKeyCallback, SortKeyWithCallback} from './models';

/**
 * Sorts an array of items _(ascending by default)_
 */
export function sort<Value>(array: Value[], descending?: boolean): Value[];

/**
 * - Sorts an array of items, using a `key` to sort by a specific value
 * - Ascending by default, but can be changed by setting `descending` to `true`, or using a `SortKey`
 */
export function sort<Value>(
	array: Value[],
	key: Key | SortKey<Value> | SortKeyCallback<Value>,
	descending?: boolean,
): Value[];

/**
 * - Sorts an array of items, using multiple `keys` to sort by specific values
 * - Ascending by default, but can be changed by setting `descending` to `true`, or using `SortKey`
 */
export function sort<Value>(
	array: Value[],
	keys: Array<Key | SortKey<Value> | SortKeyCallback<Value>>,
	descending?: boolean,
): Value[];

export function sort<Value>(
	array: Value[],
	first?:
		| boolean
		| Key
		| SortKey<Value>
		| SortKeyCallback<Value>
		| Array<Key | SortKey<Value> | SortKeyCallback<Value>>,
	second?: boolean,
): Value[] {
	if (array.length < 2) {
		return array;
	}

	if (first == null || typeof first === 'boolean') {
		return first === true
			? (array as never[]).sort((first, second) => second - first)
			: array.sort();
	}

	const direction = second === true ? 'desc' : 'asc';

	const keys = (Array.isArray(first) ? first : [first])
		.map(key => {
			const returned: SortKeyWithCallback<Value> = {
				direction,
				callback: undefined as never,
			};

			if (isKey(key)) {
				returned.callback = (value: Value) =>
					(value as PlainObject)[key] as never;
			} else if (typeof key === 'function') {
				returned.callback = key;
			} else if (typeof key?.value === 'function' || isKey(key?.value)) {
				returned.direction = key?.direction ?? direction;
				returned.callback =
					typeof key.value === 'function'
						? key.value
						: (value: Value) =>
								(value as PlainObject)[key.value as Key] as never;
			}

			return returned;
		})
		.filter(key => typeof key.callback === 'function');

	const {length} = keys;

	if (length === 0) {
		return direction === 'asc'
			? array.sort()
			: (array as never[]).sort((first, second) => second - first);
	}

	if (length === 1) {
		return array.sort(
			(first, second) =>
				compare(keys[0].callback(first), keys[0].callback(second)) *
				(keys[0].direction === 'asc' ? 1 : -1),
		);
	}

	const sorted = array.sort((first, second) => {
		for (let index = 0; index < length; index += 1) {
			const {callback, direction} = keys[index];

			const descending = direction === 'desc';

			const compared = compare(
				callback(descending ? second : first),
				callback(descending ? first : second),
			);

			if (compared !== 0) {
				return compared;
			}
		}

		return 0;
	});

	return sorted;
}
