import {between} from '../../internal/number';
import type {PlainObject} from '../../models';
import {
	ALPHA_NONE_VALUE,
	EXPRESSION_HEX_LONG,
	EXPRESSION_HEX_SHORT,
	EXPRESSION_PREFIX,
	KEYS_HSL,
	KEYS_HSLA,
	KEYS_HWB,
	KEYS_HWBA,
	KEYS_RGB,
	KEYS_RGBA,
	LENGTH_LONG,
	LENGTH_SHORT,
	MAX_DEGREE,
	MAX_HEX,
	MAX_PERCENT,
	PROPERTY_COLOR,
} from '../constants';
import type {Color} from '../index';
import type {
	ColorProperty,
	HSLAColor,
	HSLColor,
	HWBAColor,
	HWBColor,
	RGBAColor,
	RGBColor,
} from '../models';

// ##region Functions

function hasKeys(value: unknown, keys: ColorProperty[]): boolean {
	return typeof value === 'object' && value !== null && keys.every(key => key in value);
}

function isAlpha(value: unknown): value is number {
	return typeof value === 'number' && between(value, ALPHA_NONE_VALUE, MAX_PERCENT);
}

function isBytey(value: unknown): value is number {
	return typeof value === 'number' && between(value, 0, MAX_HEX);
}

/**
 * Is the value a _Color_?
 *
 * @param value Value to check
 * @returns `true` if the value is a _Color_, otherwise `false`
 */
export function isColor(value: unknown): value is Color {
	return (
		typeof value === 'object' &&
		value !== null &&
		PROPERTY_COLOR in value &&
		value[PROPERTY_COLOR] === true
	);
}

function isColorValue(obj: unknown, properties: ColorProperty[]): boolean {
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

function isDegree(value: unknown): value is number {
	return typeof value === 'number' && between(value, 0, MAX_DEGREE);
}

/**
 * Is the value a hex color?
 *
 * @param value Value to check
 * @param alpha Allow alpha channel _(opacity)_? _(defaults to `true`)_
 * @returns `true` if the value is a hex color, otherwise `false`
 *
 * @example
 * ```typescript
 * isHexColor('ff0000');  // => true
 * isHexColor('#ff0000'); // => true
 *
 * isHexColor('#ff000050');        // => true
 * isHexColor('#ff000050', false); // => false
 * ```
 */
export function isHexColor(value: unknown, alpha?: boolean): value is string {
	if (typeof value !== 'string') {
		return false;
	}

	if (!(EXPRESSION_HEX_SHORT.test(value) || EXPRESSION_HEX_LONG.test(value))) {
		return false;
	}

	if (alpha === false) {
		const unprefixed = value.replace(EXPRESSION_PREFIX, '');

		return unprefixed.length === LENGTH_SHORT || unprefixed.length === LENGTH_LONG;
	}

	return true;
}

/**
 * Is the value an _HSLA_ color?
 *
 * @param value Value to check
 * @returns `true` if the value is an _HSLA_ color, otherwise `false`
 */
export function isHslaColor(value: unknown): value is HSLAColor {
	return isColorValue(value, KEYS_HSLA);
}

export function isHslaLike(value: unknown): value is Record<keyof HSLAColor, unknown> {
	return hasKeys(value, KEYS_HSLA);
}

/**
 * Is the value an _HSL_ color?
 *
 * @param value Value to check
 * @returns `true` if the value is an _HSL_ color, otherwise `false`
 */
export function isHslColor(value: unknown): value is HSLColor {
	return isColorValue(value, KEYS_HSLA) || isColorValue(value, KEYS_HSL);
}

export function isHslLike(value: unknown): value is Record<keyof HSLColor, unknown> {
	return hasKeys(value, KEYS_HSL);
}

/**
 * Is the value an _HWBA_ color?
 *
 * @param value Value to check
 * @returns `true` if the value is an _HWBA_ color, otherwise `false`
 */
export function isHwbaColor(value: unknown): value is HWBAColor {
	return isColorValue(value, KEYS_HWBA);
}

export function isHwbaLike(value: unknown): value is Record<keyof HWBAColor, unknown> {
	return hasKeys(value, KEYS_HWBA);
}

/**
 * Is the value an _HWB_ color?
 *
 * @param value Value to check
 * @returns `true` if the value is an _HWB_ color, otherwise `false`
 */
export function isHwbColor(value: unknown): value is HWBColor {
	return isColorValue(value, KEYS_HWB) || isColorValue(value, KEYS_HWBA);
}

export function isHwbLike(value: unknown): value is Record<keyof HWBColor, unknown> {
	return hasKeys(value, KEYS_HWB);
}

/**
 * Is the value an _RGBA_ color?
 *
 * @param value Value to check
 * @returns `true` if the value is an _RGBA_ color, otherwise `false`
 */
export function isRgbaColor(value: unknown): value is RGBAColor {
	return isColorValue(value, KEYS_RGBA);
}

export function isRgbaLike(value: unknown): value is Record<keyof RGBAColor, unknown> {
	return hasKeys(value, KEYS_RGBA);
}

/**
 * Is the value an _RGB_ color?
 *
 * @param value Value to check
 * @returns `true` if the value is an _RGB_ color, otherwise `false`
 */
export function isRgbColor(value: unknown): value is RGBColor {
	return isColorValue(value, KEYS_RGBA) || isColorValue(value, KEYS_RGB);
}

export function isRgbLike(value: unknown): value is Record<keyof RGBColor, unknown> {
	return hasKeys(value, KEYS_RGB);
}

function isPercentage(value: unknown): value is number {
	return typeof value === 'number' && between(value, 0, MAX_PERCENT);
}

// #endregion

// #region Variables

const validators: Record<ColorProperty, (value: unknown) => value is number> = {
	alpha: isAlpha,
	blackness: isPercentage,
	blue: isBytey,
	green: isBytey,
	hue: isDegree,
	lightness: isPercentage,
	saturation: isPercentage,
	red: isBytey,
	whiteness: isPercentage,
};

// #endregion
