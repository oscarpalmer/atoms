/**
 * Is the number between a minimum and maximum value?
 */
export function between(value: number, min: number, max: number): boolean {
	return value >= min && value <= max;
}

/**
 * - Clamp a number between a minimum and maximum value
 * - If `loop` is `true`, when the value is less than the minimum, it will be clamped as the maximum, and vice versa
 */
export function clamp(
	value: number,
	min: number,
	max: number,
	loop?: boolean,
): number {
	if (value < min) {
		return loop === true ? max : min;
	}

	return value > max ? (loop === true ? min : max) : value;
}

/**
 * - Get the number value from an unknown value
 * - Returns `NaN` if the value is `undefined`, `null`, or cannot be parsed
 * - Based on Lodash :-)
 */
export function getNumber(value: unknown): number {
	if (typeof value === 'number') {
		return value;
	}

	if (typeof value === 'bigint' || typeof value === 'boolean') {
		return Number(value);
	}

	if (value == null || typeof value === 'symbol') {
		return Number.NaN;
	}

	let parsed = value.valueOf();

	if (typeof parsed === 'object') {
		parsed = parsed.toString();
	}

	if (typeof parsed !== 'string') {
		return getNumber(parsed);
	}

	const trimmed = parsed.trim();

	if (trimmed.length === 0) {
		return Number.NaN;
	}

	if (zeroIshExpression.test(parsed)) {
		return 0;
	}

	const isBinary = binaryExpression.test(trimmed);

	if (isBinary || octalExpression.test(trimmed)) {
		return Number.parseInt(trimmed.slice(2), isBinary ? 2 : 8);
	}

	return Number(
		hexExpression.test(trimmed)
			? trimmed
			: trimmed.replace(underscoreExpression, ''),
	);
}

//

const binaryExpression = /^0b[01]+$/i;
const hexExpression = /^0x[0-9a-f]+$/i;
const octalExpression = /^0o[0-7]+$/i;
const underscoreExpression = /_/g;
const zeroIshExpression = /^\s*0+\s*$/;
