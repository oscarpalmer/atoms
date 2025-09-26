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
	if (![value, minimum, maximum].every(isNumber)) {
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
 * @param minimum Minimum value
 * @param maximum Maximum value
 * @param loop If `true`, the value will loop around when smaller than the minimum or larger than the maximum _(defaults to `false`)_
 * @returns Clamped value between the minimum and maximum
 */
export function clamp(
	value: number,
	minimum: number,
	maximum: number,
	loop?: boolean,
): number {
	if (![value, minimum, maximum].every(isNumber)) {
		return Number.NaN;
	}

	if (value < minimum) {
		return loop === true ? maximum : minimum;
	}

	return value > maximum ? (loop === true ? minimum : maximum) : value;
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

	if (EXPRESSION_ZEROISH.test(parsed)) {
		return 0;
	}

	const isBinary = EXPRESSION_BINARY.test(trimmed);

	if (isBinary || EXPRESSION_OCTAL.test(trimmed)) {
		return Number.parseInt(trimmed.slice(2), isBinary ? 2 : OCTAL_VALUE);
	}

	return Number(
		EXPRESSION_HEX.test(trimmed)
			? trimmed
			: trimmed.replace(EXPRESSION_UNDERSCORE, ''),
	);
}

//

const EXPRESSION_BINARY = /^0b[01]+$/i;

const EXPRESSION_HEX = /^0x[0-9a-f]+$/i;

const EXPRESSION_OCTAL = /^0o[0-7]+$/i;

const EXPRESSION_UNDERSCORE = /_/g;

const EXPRESSION_ZEROISH = /^\s*0+\s*$/;

const OCTAL_VALUE = 8;
