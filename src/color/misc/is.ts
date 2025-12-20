import {between} from '../../internal/number';
import type {PlainObject} from '../../models';
import {
	ALPHA_FULL_VALUE,
	ALPHA_NONE_VALUE,
	EXPRESSION_HEX_LONG,
	EXPRESSION_HEX_SHORT,
	KEYS_HSL,
	KEYS_HSLA,
	KEYS_RGB,
	KEYS_RGBA,
	LENGTH_LONG,
	LENGTH_SHORT,
	MAX_DEGREE,
	MAX_HEX,
	MAX_PERCENT,
} from '../constants';
import type {Color} from '../index';
import type {ColorProperty, HSLAColor, HSLColor, RGBAColor, RGBColor} from '../models';

function hasKeys(value: unknown, keys: ColorProperty[]): boolean {
	return typeof value === 'object' && value !== null && keys.every(key => key in value);
}

function isAlpha(value: unknown): value is number {
	return typeof value === 'number' && between(value, ALPHA_NONE_VALUE, ALPHA_FULL_VALUE);
}

function isBytey(value: unknown): value is number {
	return typeof value === 'number' && between(value, 0, MAX_HEX);
}

/**
 * Is the value a Color?
 * @param value The value to check
 * @returns `true` if the value is a Color, otherwise `false`
 */
export function isColor(value: unknown): value is Color {
	return typeof value === 'object' && value !== null && '$color' in value && value.$color === true;
}

function isDegree(value: unknown): value is number {
	return typeof value === 'number' && between(value, 0, MAX_DEGREE);
}

/**
 * Is the value a hex color?
 * @param value The value to check
 * @param alpha Allow alpha channel? _(defaults to `true`)_
 * @returns `true` if the value is a hex color, otherwise `false`
 */
export function isHexColor(value: unknown, alpha?: boolean): value is string {
	if (typeof value !== 'string') {
		return false;
	}

	if (!(EXPRESSION_HEX_SHORT.test(value) || EXPRESSION_HEX_LONG.test(value))) {
		return false;
	}

	if (alpha === false) {
		return value.length === LENGTH_SHORT || value.length === LENGTH_LONG;
	}

	return true;
}

/**
 * Is the value an HSLA color?
 * @param value The value to check
 * @returns `true` if the value is an HSLA color, otherwise `false`
 */
export function isHslaColor(value: unknown): value is HSLAColor {
	return isObject(value, KEYS_HSLA);
}

/**
 * Is the value an HSL color?
 * @param value The value to check
 * @returns `true` if the value is an HSL color, otherwise `false`
 */
export function isHslColor(value: unknown): value is HSLColor {
	return isObject(value, KEYS_HSLA) || isObject(value, KEYS_HSL);
}

export function isHslLike(value: unknown): value is Record<keyof HSLColor, unknown> {
	return hasKeys(value, KEYS_HSL);
}

/**
 * Is the value an RGBA color?
 * @param value The value to check
 * @returns `true` if the value is an RGBA color, otherwise `false`
 */
export function isRgbaColor(value: unknown): value is RGBAColor {
	return isObject(value, KEYS_RGBA);
}

/**
 * Is the value an RGB color?
 * @param value The value to check
 * @returns `true` if the value is an RGB color, otherwise `false`
 */
export function isRgbColor(value: unknown): value is RGBColor {
	return isObject(value, KEYS_RGBA) || isObject(value, KEYS_RGB);
}

export function isRgbLike(value: unknown): value is Record<keyof RGBColor, unknown> {
	return hasKeys(value, KEYS_RGB);
}

function isObject(obj: unknown, properties: ColorProperty[]): boolean {
	if (typeof obj !== 'object' || obj === null) {
		return false;
	}

	const keys = Object.keys(obj);
	const {length} = keys;

	if (length !== properties.length) {
		return false;
	}

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		if (
			!(
				properties.includes(key as never) &&
				validators[key as ColorProperty]((obj as PlainObject)[key])
			)
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
	alpha: isAlpha,
	blue: isBytey,
	green: isBytey,
	hue: isDegree,
	lightness: isPercentage,
	saturation: isPercentage,
	red: isBytey,
};
