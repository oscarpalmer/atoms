/**
 * - Clamps a number between a minimum and maximum value
 * - If `loop` is `true`, when the value is less than the minimum, it will be clamped as the maximum, and vice versa
 */
export function clamp(
	value: number,
	min: number,
	max: number,
	loop?: boolean,
): number {
	const maxNumber = getNumber(max);
	const minNumber = getNumber(min);
	const valueNumber = getNumber(value);
	const shouldLoop = loop === true;

	if (valueNumber < minNumber) {
		return shouldLoop ? maxNumber : minNumber;
	}

	return valueNumber > maxNumber
		? shouldLoop
			? minNumber
			: maxNumber
		: valueNumber;
}

/**
 * - Gets the number value from an unknown value
 * - Returns `NaN` if the value is `undefined`, `null`, or cannot be parsed
 * - Based on Lodash :-)
 */
export function getNumber(value: unknown): number {
	if (typeof value === 'number') {
		return value;
	}

	if (typeof value === 'symbol') {
		return NaN;
	}

	let parsed = value?.valueOf?.() ?? value;

	if (typeof parsed === 'object') {
		parsed = parsed?.toString() ?? parsed;
	}

	if (typeof parsed !== 'string') {
		return parsed == null ? NaN : typeof parsed === 'number' ? parsed : +parsed;
	}

	if (/^\s*0+\s*$/.test(parsed)) {
		return 0;
	}

	const trimmed = parsed.trim();

	if (trimmed.length === 0) {
		return NaN;
	}

	const isBinary = /^0b[01]+$/i.test(trimmed);

	if (isBinary || /^0o[0-7]+$/i.test(trimmed)) {
		return parseInt(trimmed.slice(2), isBinary ? 2 : 8);
	}

	return +(/^0x[0-9a-f]+$/i.test(trimmed)
		? trimmed
		: trimmed.replace(/_/g, ''));
}
