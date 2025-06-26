/**
 * Create a new UUID
 */
export function createUuid(): string {
	return uuidTemplate.replace(uuidPartExpression, (substring: string) => {
		const digit = Number.parseInt(substring, 10);
		const random = crypto.getRandomValues(new Uint8Array(1))[0];

		return (digit ^ (random & (15 >> (digit / 4)))).toString(16);
	});
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

//

const uuidPartExpression = /[018]/g;

const uuidTemplate = '10000000-1000-4000-8000-100000000000';
