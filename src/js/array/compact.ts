/**
 * Compact an array _(removing all `null` and `undefined` values)_
 */
export function compact<Item>(array: Item[]): Exclude<Item, null | undefined>[];

/**
 * Compact an array _(removing all falsey values)_
 */
export function compact<Item>(
	array: Item[],
	strict: true,
): Exclude<Item, 0 | '' | false | null | undefined>[];

export function compact<Item>(array: Item[], strict?: boolean): Item[] {
	return strict === true
		? array.filter(item => !!item)
		: array.filter(item => item != null);
}
