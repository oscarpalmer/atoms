/**
 * Create a new UUID-string
 * @returns UUID string
 */
export function createUuid(): string {
	return TEMPLATE_UUID.replace(EXPRESSION_UUID_PART, (substring: string) => {
		const digit = Number.parseInt(substring, 10);
		const random = crypto.getRandomValues(new Uint8Array(1))[0];

		return (digit ^ (random & (15 >> (digit / 4)))).toString(16);
	});
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
 * Truncate a string to a specified length, when possible
 * @param value String to truncate
 * @param length Maximum length of the string after truncation
 * @param suffix Suffix to append to the truncated string
 * @returns Truncated string
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

//

const EXPRESSION_UUID_PART = /[018]/g;

const TEMPLATE_UUID = '10000000-1000-4000-8000-100000000000';
