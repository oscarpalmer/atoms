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
