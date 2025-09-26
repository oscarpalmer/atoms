import {between} from '../internal/number';
import type {PlainObject} from '../models';
import {
	EXPRESSION_ANY,
	KEYS_HSL,
	KEYS_RGB,
	MAX_DEGREE,
	MAX_HEX,
	MAX_PERCENT,
} from './constants';
import type {Color} from './index';
import type {ColorProperty, HSLColor, RGBColor} from './models';

function isBytey(value: unknown): value is number {
	return typeof value === 'number' && between(value, 0, MAX_HEX);
}

/**
 * Is the value a color?
 * @param value The value to check
 * @returns `true` if the value is a color, `false` otherwise
 */
export function isColor(value: unknown): value is Color {
	return (
		typeof value === 'object' &&
		value !== null &&
		'$color' in value &&
		value.$color === true
	);
}

function isDegree(value: unknown): value is number {
	return typeof value === 'number' && between(value, 0, MAX_DEGREE);
}

/**
 * Is the value a hex-color?
 * @param value The value to check
 * @returns `true` if the value is a hex-color, `false` otherwise
 */
export function isHexColor(value: unknown): value is string {
	return typeof value === 'string' && EXPRESSION_ANY.test(value);
}

/**
 * Is the value an HSL-color?
 * @param value The value to check
 * @returns `true` if the value is an HSL-color, `false` otherwise
 */
export function isHSLColor(value: unknown): value is HSLColor {
	return isObject(value, KEYS_HSL);
}

/**
 * Is the value an RGB-color?
 * @param value The value to check
 * @returns `true` if the value is an RGB-color, `false` otherwise
 */
export function isRGBColor(value: unknown): value is RGBColor {
	return isObject(value, KEYS_RGB);
}

/**
 * Is the value an object with the given properties and value requirements?
 */
function isObject(obj: unknown, properties: Set<ColorProperty>): boolean {
	if (typeof obj !== 'object' || obj === null) {
		return false;
	}

	const keys = Object.keys(obj);
	const {length} = keys;

	if (length !== properties.size) {
		return false;
	}

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (
			!properties.has(key as never) ||
			!validators[key as ColorProperty]((obj as PlainObject)[key])
		) {
			return false;
		}
	}

	return true;
}

function isPercentage(value: unknown): value is number {
	return typeof value === 'number' && between(value, 0, MAX_PERCENT);
}

//

const validators: Record<ColorProperty, (value: unknown) => value is number> = {
	blue: isBytey,
	green: isBytey,
	hue: isDegree,
	lightness: isPercentage,
	saturation: isPercentage,
	red: isBytey,
};
