import {
	EXPRESSION_NUMBER_BINARY,
	EXPRESSION_NUMBER_OCTAL,
	EXPRESSION_NUMBER_ZEROISH,
	NUMBER_OCTAL_VALUE,
} from '../models/misc.model';
import {isNumber} from './is';
import {max, min} from './math/aggregate';

// #region Functions

/**
 * Is the number between a minimum and maximum value?
 *
 * @param value Value to check
 * @param minimum Minimum value
 * @param maximum Maximum value _(inclusive)_
 * @returns `true` if the value is between the minimum and maximum, otherwise `false`
 *
 * @example
 * ```typescript
 * between(5, 1, 10); // => true
 * between(0, 1, 10); // => false
 * between(10, 10, 10); // => true
 * ```
 */
export function between(value: number, minimum: number, maximum: number): boolean {
	if (![value, minimum, maximum].every(isNumber)) {
		return false;
	}

	if (Object.is(minimum, maximum)) {
		return Object.is(value, minimum);
	}

	const maximumValue = max([maximum, minimum]);
	const minimumValue = min([maximum, minimum]);

	return value >= minimumValue && value <= maximumValue;
}

/**
 * Clamp a number between a minimum and maximum value
 *
 * @param value Value to clamp
 * @param minimum Minimum value
 * @param maximum Maximum value
 * @param loop If `true`, the value will loop around when smaller than the minimum or larger than the maximum _(defaults to `false`)_
 * @returns Clamped value
 *
 * @example
 * ```typescript
 * clamp(10, 0, 5);       // => 5
 * clamp(10, 0, 5, true); // => 0
 * ```
 */
export function clamp(value: number, minimum: number, maximum: number, loop?: boolean): number {
	if (![value, minimum, maximum].every(isNumber)) {
		return Number.NaN;
	}

	if (value < minimum) {
		return loop === true ? maximum : minimum;
	}

	const next = loop === true ? minimum : maximum;

	return value > maximum ? next : value;
}

/**
 * Get the number value from an unknown value
 *
 * _(Based on Lodash)_
 *
 * @param value Original value
 * @returns Original value as a number, or `Number.NaN` if the value is unable to be parsed
 *
 * @example
 * ```typescript
 * getNumber(null)       // => Number.NaN
 * getNumber('foo')      // => Number.NaN
 * getNumber('123')        // => 123
 * getNumber(true)       // => 1
 * getNumber([1, 2, 3])  // => Number.NaN
 * getNumber({a: 1})     // => Number.NaN
 * getNumber(() => 123)  // => 123
 * ```
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

	if (typeof value === 'function') {
		return getNumber(value());
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

	if (EXPRESSION_NUMBER_ZEROISH.test(parsed)) {
		return 0;
	}

	const isBinary = EXPRESSION_NUMBER_BINARY.test(trimmed);

	if (isBinary || EXPRESSION_NUMBER_OCTAL.test(trimmed)) {
		return Number.parseInt(trimmed.slice(2), isBinary ? 2 : NUMBER_OCTAL_VALUE);
	}

	return Number(trimmed);
}

// #endregion
