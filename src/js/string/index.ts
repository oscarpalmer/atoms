import {compact} from '../array';

/**
 * Create a new UUID
 */
export function createUuid(): string {
	return '10000000-1000-4000-8000-100000000000'.replace(
		/[018]/g,
		(substring: string) =>
			(
				(substring as never) ^
				(crypto.getRandomValues(new Uint8Array(1))[0] &
					(15 >> ((substring as never) / 4)))
			).toString(16),
	);
}

/**
 * Get the string value from any value
 */
export function getString(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}

	if (typeof value !== 'object' || value == null) {
		return String(value);
	}

	const valueOff = value.valueOf?.() ?? value;
	const asString = valueOff?.toString?.() ?? String(valueOff);

	return asString.startsWith('[object ') ? JSON.stringify(value) : asString;
}

/**
 * Joins an array into a string while ignoring empty values _(with an optional delimiter)_
 */
export function join(value: unknown[], delimiter?: string): string {
	return compact(value)
		.map(getString)
		.filter(value => value.trim().length > 0)
		.join(typeof delimiter === 'string' ? delimiter : '');
}

/**
 * Parses a JSON string into its proper value _(or `undefined` if it fails)_
 */
export function parse(
	value: string,
	reviver?: (this: unknown, key: string, value: unknown) => unknown,
): unknown {
	try {
		return JSON.parse(value, reviver);
	} catch {
		// ?
	}
}

/**
 * Truncates a string to a specified length, when possible
 * - Returned as-is if the string is already short enough
 * - A suffix may be appended to the truncated string, e.g., an ellipsis
 */
export function truncate(
	value: string,
	length: number,
	suffix?: string,
): string {
	const suffixLength = suffix?.length ?? 0;
	const truncatedLength = length - suffixLength;

	return value.length <= length
		? value
		: `${value.slice(0, truncatedLength)}${suffix ?? ''}`;
}

/**
 * Split a string into words _(and other readable parts)_
 */
export function words(value: string): string[] {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: Lodash uses it, so it's fine ;-)
	return value.match(/[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g) ?? [];
}

export * from './case';
export * from './template';

