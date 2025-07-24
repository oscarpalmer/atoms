import {isNumber} from './is';

/**
 * Is the number between a minimum and maximum value?
 * @param value Value to check
 * @param minimum Minimum value
 * @param maximum Maximum value
 * @returns `true` if the value is between the minimum and maximum, `false` otherwise
 */
export function between(
	value: number,
	minimum: number,
	maximum: number,
): boolean {
	if (!isNumber(value) || !isNumber(minimum) || !isNumber(maximum)) {
		return false;
	}

	if (minimum === maximum) {
		return value === minimum;
	}

	const max = maximum > minimum ? maximum : minimum;
	const min = maximum > minimum ? minimum : maximum;

	return value >= min && value <= max;
}

/**
 * Clamp a number between a minimum and maximum value
 * @param value Value to clamp
 * @param min Minimum value
 * @param max Maximum value
 * @param loop If `true`, the value will loop around when smaller than the minimum or larger than the maximum _(defaults to `false`)_
 * @returns Clamped value between the minimum and maximum
 */
export function clamp(
	value: number,
	min: number,
	max: number,
	loop?: boolean,
): number {
	if (!isNumber(value) || !isNumber(min) || !isNumber(max)) {
		return Number.NaN;
	}

	if (value < min) {
		return loop === true ? max : min;
	}

	return value > max ? (loop === true ? min : max) : value;
}

/**
 * Get the number value from an unknown value _(based on Lodash)_
 * @param value Value to get the number from
 * @returns The number value of the value, or `NaN` if the value is unable to be parsed
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
