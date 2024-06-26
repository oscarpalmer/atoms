import {isNullableOrWhitespace} from './is';

/**
 * Convert a string to camel case _(thisIsCamelCase)_
 */
export function camelCase(value: string): string {
	return toCase(value, '', true, false);
}

/**
 * Capitalise the first letter of a string _(and lowercase the rest)_
 */
export function capitalise(value: string): string {
	if (value.length === 0) {
		return value;
	}

	return value.length === 1
		? value.toLocaleUpperCase()
		: `${value.charAt(0).toLocaleUpperCase()}${value.slice(1).toLocaleLowerCase()}`;
}

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
	return value
		.filter(item => !isNullableOrWhitespace(item))
		.map(getString)
		.join(typeof delimiter === 'string' ? delimiter : '');
}

/**
 * Convert a string to kebab case _(this-is-kebab-case)_
 */
export function kebabCase(value: string): string {
	return toCase(value, '-', false, false);
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
 * Convert a string to pascal case _(ThisIsPascalCase)_
 */
export function pascalCase(value: string): string {
	return toCase(value, '', true, true);
}

/**
 * Convert a string to snake case _(this_is_snake_case)_
 */
export function snakeCase(value: string): string {
	return toCase(value, '_', false, false);
}

/**
 * Convert a string to title case _(capitalising every word)_
 */
export function titleCase(value: string): string {
	return words(value).map(capitalise).join(' ');
}

function toCase(
	value: string,
	delimiter: string,
	capitaliseAny: boolean,
	capitaliseFirst: boolean,
): string {
	return words(value)
		.map((word, index) => {
			/**
			 * Splitting formatted words into parts:
			 * 1. `IDs` -> `['IDs']`
			 * 2. `safeHTML` -> `['safe', 'HTML']`
			 * 3. `escapeHTMLEntities` -> `['escape', 'HTML', 'Entities']`
			 */
			const parts = word
				.replace(/(\p{Lu}*)(\p{Lu})(\p{Ll}+)/gu, (full, one, two, three) =>
					three === 's' ? full : `${one}-${two}${three}`,
				)
				.replace(/(\p{Ll})(\p{Lu})/gu, '$1-$2')
				.split('-');

			return parts
				.filter(part => part.length > 0)
				.map((part, partIndex) =>
					!capitaliseAny || (partIndex === 0 && index === 0 && !capitaliseFirst)
						? part.toLocaleLowerCase()
						: capitalise(part),
				)
				.join(delimiter);
		})
		.join(delimiter);
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

export {capitalise as capitalize};

