import {compact} from './array/compact';

/**
 * Get the string value from any value
 * @param value Original value
 * @returns String representation of the value
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

export function ignoreKey(key: string): boolean {
	return EXPRESSION_IGNORED.test(key);
}

/**
 * Join an array of values into a string
 * @param value Array of values
 * @param delimiter Delimiter to use between values
 * @returns Joined string
 */
export function join(value: unknown[], delimiter?: string): string {
	return compact(value)
		.map(getString)
		.join(typeof delimiter === 'string' ? delimiter : '');
}

function tryCallback<T, U>(value: T, callback: (value: T) => U): U {
	try {
		return callback(value);
	} catch {
		return value as never;
	}
}

export function tryDecode(value: string): string {
	return tryCallback(value, decodeURIComponent);
}

export function tryEncode(value: boolean | number | string): unknown {
	return tryCallback(value, encodeURIComponent);
}

/**
 * Split a string into words _(and other readable parts)_
 * @param value Original string
 * @returns Array of words found in the string
 */
export function words(value: string): string[] {
	return typeof value === 'string' ? (value.match(EXPRESSION_WORDS) ?? []) : [];
}

//

const EXPRESSION_IGNORED = /(^|\.)(__proto__|constructor|prototype)(\.|$)/i;

// biome-ignore lint/suspicious/noControlCharactersInRegex: Lodash uses it, so it's fine ;-)
const EXPRESSION_WORDS = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
