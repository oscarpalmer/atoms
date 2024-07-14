/**
 * Compacts and returns an array with all falsey values removed
 */
export function compact<Value>(
	array: Value[],
	strict: true,
): Exclude<Value, 0 | '' | false | null | undefined>[];

/**
 * Compacts and returns an array with all `null` and `undefined` values removed
 */
export function compact<Value>(
	array: Value[],
): Exclude<Value, null | undefined>[];

export function compact<Value>(array: Value[], strict?: boolean): Value[] {
	return strict === true
		? array.filter(item => !!item)
		: array.filter(item => item != null);
}
