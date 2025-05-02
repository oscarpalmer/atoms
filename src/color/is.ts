import {between} from '../internal/number';
import type {PlainObject} from '../models';
import {anyPattern, hslKeys, rgbKeys} from './constants';
import type {Color} from './index';
import type {ColorProperty, HSLColor, RGBColor} from './models';

/**
 * Is the value a color?
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
	return typeof value === 'number' && between(value, 0, 360);
}

/**
 * Is the value a hex-color?
 */
export function isHexColor(value: unknown): value is string {
	return typeof value === 'string' && anyPattern.test(value);
}

function isHexy(value: unknown): value is number {
	return typeof value === 'number' && between(value, 0, 255);
}

/**
 * Is the value an HSL-color?
 */
export function isHSLColor(value: unknown): value is HSLColor {
	return isObject(value, hslKeys);
}

/**
 * Is the value an RGB-color?
 */
export function isRGBColor(value: unknown): value is RGBColor {
	return isObject(value, rgbKeys);
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
	return typeof value === 'number' && between(value, 0, 100);
}

const validators: Record<ColorProperty, (value: unknown) => value is number> = {
	blue: isHexy,
	green: isHexy,
	hue: isDegree,
	lightness: isPercentage,
	saturation: isPercentage,
	red: isHexy,
};
