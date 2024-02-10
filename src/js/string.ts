/**
 * Create a new UUID
 */
export function createUuid(): string {
	return '10000000-1000-4000-8000-100000000000'.replace(
		/[018]/g,
		(substring: any) =>
			(
				substring ^
				(crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (substring / 4)))
			).toString(16),
	);
}

/**
 * Get the string value from any value
 */
export function getString(value: unknown): string {
	return typeof value === 'string'
		? value
		: typeof value?.toString === 'function'
		  ? value.toString()
		  : String(value);
}

/**
 * Is the value undefined, null, or an empty string?
 */
export function isNullableOrWhitespace(
	value: unknown,
): value is undefined | null | '' {
	return value == null || getString(value).trim().length === 0;
}
