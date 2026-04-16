import {isTemplateStringsArray} from '../internal/is';
import {getString} from '../internal/string';

// #region Functions

export function dedent(strings: TemplateStringsArray, ...values: unknown[]): string;

export function dedent(value: string): string;

export function dedent(value: string | TemplateStringsArray, ...values: unknown[]): string {
	let actual: string;

	if (isTemplateStringsArray(value)) {
		actual = interpolate(value, values);
	} else {
		actual = value;
	}

	if (typeof actual !== 'string') {
		return '';
	}

	const lines = actual.split('\n');
	const {length} = lines;

	if (length === 1) {
		return actual.trim();
	}

	const lastIndex = length - 1;

	const lengths: number[] = [];

	for (let index = 0; index < length; index += 1) {
		const [, indentation] = /^(\s+)/.exec(lines[index]) ?? [];

		if (indentation != null) {
			lengths.push(indentation.length);
		}
	}

	if (lengths.length === 0) {
		return actual.trim();
	}

	const minimum = Math.min(...lengths);

	const pattern = new RegExp(`^\\s{0,${minimum}}`);

	let result = '';

	for (let index = 0; index < length; index += 1) {
		const line = lines[index];

		result += line.replace(pattern, '') + (index === lastIndex ? '' : '\n');
	}

	return result.trim();
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

	const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, ZERO)).join('');

	return [
		hex.substring(0, 8),
		hex.substring(8, 12),
		hex.substring(12, 16),
		hex.substring(16, 20),
		hex.substring(20, 32),
	].join('-');
}

function interpolate(strings: TemplateStringsArray, values: unknown[]): string {
	const {length} = strings;

	let interpolated = '';

	for (let index = 0; index < length; index += 1) {
		interpolated += `${strings[index]}${getString(values[index])}`;
	}

	return interpolated;
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

// #region Variables

const ZERO = '0';

// #endregion

// #endregion

// #region Exports

export {getString, join, words} from '../internal/string';

// #endregion
