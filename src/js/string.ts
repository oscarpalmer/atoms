/**
 * Capitalise the first letter of a string _(and lowercase the rest)_
 */
export function capitalise(value: string): string {
	if (value.length === 0) {
		return value;
	}
	return value.length === 1
		? value.toLocaleUpperCase()
		: value.charAt(0).toLocaleUpperCase() + value.slice(1).toLocaleLowerCase();
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
 * Convert a string to title case _(capitalising every word)_
 */
export function titleCase(value: string): string {
	return value
		.split(/\s+/)
		.map(word => capitalise(word))
		.join(' ');
}

export {capitalise as capitalize};
