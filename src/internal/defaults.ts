export function getBooleanOrDefault(value: unknown, defaultValue: boolean): boolean {
	return typeof value === 'boolean' ? value : defaultValue;
}

export function getNumberOrDefault(value: unknown, defaultValue: number, minimum?: number): number {
	return typeof value === 'number' && !Number.isNaN(value) && value >= (minimum ?? 0)
		? value
		: defaultValue;
}
