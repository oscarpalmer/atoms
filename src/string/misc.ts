import {compact} from '../array/compact';

/**
 * Create a new UUID
 */
export function createUuid(): string {
	return uuidTemplate.replace(/[018]/g, (substring: string) => {
		const digit = Number.parseInt(substring, 10);
		const random = crypto.getRandomValues(new Uint8Array(1))[0];

		return (digit ^ (random & (15 >> (digit / 4)))).toString(16);
	});
}

/**
 * Get the string value from any value
 */
export function getString(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}

	if (value == null) {
		return '';
	}

	if (typeof value !== 'object') {
		return String(value);
	}

	const asString = String(value.valueOf?.() ?? value);

	return asString.startsWith('[object ') ? JSON.stringify(value) : asString;
}

/**
 * Join an array into a string while ignoring empty values _(with an optional delimiter)_
 */
export function join(value: unknown[], delimiter?: string): string {
	return compact(value)
		.map(getString)
		.filter(value => value.trim().length > 0)
		.join(typeof delimiter === 'string' ? delimiter : '');
}

/**
 * Parse a JSON string into its proper value _(or `undefined` if it fails)_
 */
export function parse(
	value: string,
	reviver?: (this: unknown, key: string, value: unknown) => unknown,
): unknown {
	try {
		return JSON.parse(value, reviver);
	} catch {
		return undefined;
	}
}

/**
 * Truncate a string to a specified length, when possible
 * - Returned as-is if the string is already short enough
 * - A suffix may be appended to the truncated string, e.g., an ellipsis
 */
export function truncate(
	value: string,
	length: number,
	suffix?: string,
): string {
	if (typeof value !== 'string' || typeof length !== 'number' || length <= 0) {
		return '';
	}

	if (length >= value.length) {
		return value;
	}

	const actualSuffix = typeof suffix === 'string' ? suffix : '';
	const truncatedLength = length - actualSuffix.length;

	return `${value.slice(0, truncatedLength)}${actualSuffix}`;
}

/**
 * Split a string into words _(and other readable parts)_
 */
export function words(value: string): string[] {
	return typeof value === 'string' ? (value.match(wordsExpression) ?? []) : [];
}

const uuidTemplate = '10000000-1000-4000-8000-100000000000';

// biome-ignore lint/suspicious/noControlCharactersInRegex: Lodash uses it, so it's fine ;-)
const wordsExpression = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
