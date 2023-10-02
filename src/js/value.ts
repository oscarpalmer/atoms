/**
 * Is the value undefined or null?
 */
export function isNullable(value: unknown): value is undefined | null {
	return value === undefined || value === null;
}
