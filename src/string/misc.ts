import {memoize, type Memoized} from '../function';

// #region Types

type Match = 'endsWith' | 'includes' | 'startsWith';

// #endregion

// #region Functions

/**
 * Check if a string ends with a specified substring
 * @param haystack String to look in
 * @param needle String to look for
 * @param ignoreCase Ignore case when matching? _(defaults to `false`)_
 * @returns `true` if the string ends with the given substring, otherwise `false`
 */
export function endsWith(haystack: string, needle: string, ignoreCase?: boolean): boolean {
	return match('endsWith', haystack, needle, ignoreCase === true);
}

/**
 * Get a new UUID-string _(version 4)_
 * @returns UUID string
 */
export function getUuid(): string {
	const bytes = new Uint8Array(16);

	crypto.getRandomValues(bytes);

	bytes[6] = (bytes[6] & 0x0f) | 0x40;

	bytes[8] = (bytes[8] & 0x3f) | 0x80;

	const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

	return [
		hex.substring(0, 8),
		hex.substring(8, 12),
		hex.substring(12, 16),
		hex.substring(16, 20),
		hex.substring(20, 32),
	].join('-');
}

/**
 * Check if a string includes a specified substring
 * @param haystack String to look in
 * @param needle String to look for
 * @param ignoreCase Ignore case when matching? _(defaults to `false`)_
 * @returns `true` if the string includes the given substring, otherwise `false`
 */
export function includes(haystack: string, needle: string, ignoreCase?: boolean): boolean {
	return match('includes', haystack, needle, ignoreCase === true);
}

function match(type: Match, haystack: string, needle: string, ignoreCase: boolean): boolean {
	if (typeof haystack !== 'string' || typeof needle !== 'string') {
		return false;
	}

	matchMemoizers[type] ??= memoize(matchCallback.bind(type));

	return matchMemoizers[type].run(haystack, needle, ignoreCase);
}

function matchCallback(
	this: Match,
	haystack: string,
	needle: string,
	ignoreCase: boolean,
): boolean {
	return (ignoreCase ? haystack.toLocaleLowerCase() : haystack)[this](
		ignoreCase ? needle.toLocaleLowerCase() : needle,
	);
}

/**
 * Parse a JSON string into its proper value _(or `undefined` if it fails)_
 * @param value JSON string to parse
 * @param reviver Reviver function to transform the parsed values
 * @returns Parsed value or `undefined` if parsing fails
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
 * Check if a string starts with a specified substring
 * @param haystack String to look in
 * @param needle String to look for
 * @param ignoreCase Ignore case when matching? _(defaults to `false`)_
 * @returns `true` if the string starts with the given substring, otherwise `false`
 */
export function startsWith(haystack: string, needle: string, ignoreCase?: boolean): boolean {
	return match('startsWith', haystack, needle, ignoreCase === true);
}

/**
 * Trim a string _(removing whitespace from both ends)_
 * @param value String to trim
 * @returns Trimmed string
 */
export function trim(value: string): string {
	return typeof value === 'string' ? value.trim() : '';
}

/**
 * Truncate a string to a specified length, when possible
 * @param value String to truncate
 * @param length Maximum length of the string after truncation
 * @param suffix Suffix to append to the truncated string
 * @returns Truncated string
 */
export function truncate(value: string, length: number, suffix?: string): string {
	if (typeof value !== 'string' || typeof length !== 'number' || length === 0) {
		return '';
	}

	if (length >= value.length) {
		return value;
	}

	const actualSuffix = typeof suffix === 'string' ? suffix : '';
	const actualSuffixLength = actualSuffix.length;

	if (length <= actualSuffixLength) {
		return actualSuffix;
	}

	const truncatedLength = length - actualSuffixLength;

	return `${value.slice(0, truncatedLength)}${actualSuffix}`;
}

// #endregion

// #region Constants

const matchMemoizers: Partial<Record<Match, Memoized<typeof matchCallback>>> = {};

// #endregion
