import {between} from '../../internal/number';
import {isSubscription, SUBSCRIPTION_NAME, type Subscription} from '../../internal/subscription';
import type {PlainObject} from '../../models';
import {
	COLOR_ALPHA,
	COLOR_EXPRESSION,
	COLOR_KEYS,
	COLOR_LENGTHS,
	COLOR_MAX,
	COLOR_NAME,
	COLOR_PROPERTY,
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
	return typeof value === 'number' && between(value, COLOR_ALPHA.noneValue, COLOR_MAX.percent);
}

function isBytey(value: unknown): value is number {
	return typeof value === 'number' && between(value, 0, COLOR_MAX.hex);
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
		COLOR_PROPERTY in value &&
		value[COLOR_PROPERTY] === COLOR_NAME
	);
}

/**
 * Is the value a color subscription?
 *
 * @param value Value to check
 * @returns `true` if the value is a color subscription, otherwise `false`
 */
export function isColorSubscription(value: unknown): value is Subscription {
	return (
		isSubscription(value) && COLOR_PROPERTY in value && value[COLOR_PROPERTY] === SUBSCRIPTION_NAME
	);
}

function isColorValue(value: unknown, properties: ColorProperty[]): boolean {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const keys = Object.keys(value);
	const {length} = keys;

	if (length !== properties.length) {
		return false;
	}

	const obj = value as PlainObject;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index] as ColorProperty;

		if (!(properties.includes(key) && validators[key](obj[key]))) {
			return false;
		}
	}

	return true;
}

function isDegree(value: unknown): value is number {
	return typeof value === 'number' && between(value, 0, COLOR_MAX.degree);
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

	if (!(COLOR_EXPRESSION.hexShort.test(value) || COLOR_EXPRESSION.hexLong.test(value))) {
		return false;
	}

	if (alpha === false) {
		const unprefixed = value.replace(COLOR_EXPRESSION.prefix, '');

		return (
			unprefixed.length === COLOR_LENGTHS.hexShort || unprefixed.length === COLOR_LENGTHS.hexLong
		);
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
	return isColorValue(value, COLOR_KEYS.hsla);
}

export function isHslaLike(value: unknown): value is Record<keyof HSLAColor, unknown> {
	return hasKeys(value, COLOR_KEYS.hsla);
}

/**
 * Is the value an _HSL_ color?
 *
 * @param value Value to check
 * @returns `true` if the value is an _HSL_ color, otherwise `false`
 */
export function isHslColor(value: unknown): value is HSLColor {
	return isColorValue(value, COLOR_KEYS.hsla) || isColorValue(value, COLOR_KEYS.hsl);
}

export function isHslLike(value: unknown): value is Record<keyof HSLColor, unknown> {
	return hasKeys(value, COLOR_KEYS.hsl);
}

/**
 * Is the value an _HWBA_ color?
 *
 * @param value Value to check
 * @returns `true` if the value is an _HWBA_ color, otherwise `false`
 */
export function isHwbaColor(value: unknown): value is HWBAColor {
	return isColorValue(value, COLOR_KEYS.hwba);
}

export function isHwbaLike(value: unknown): value is Record<keyof HWBAColor, unknown> {
	return hasKeys(value, COLOR_KEYS.hwba);
}

/**
 * Is the value an _HWB_ color?
 *
 * @param value Value to check
 * @returns `true` if the value is an _HWB_ color, otherwise `false`
 */
export function isHwbColor(value: unknown): value is HWBColor {
	return isColorValue(value, COLOR_KEYS.hwb) || isColorValue(value, COLOR_KEYS.hwba);
}

export function isHwbLike(value: unknown): value is Record<keyof HWBColor, unknown> {
	return hasKeys(value, COLOR_KEYS.hwb);
}

/**
 * Is the value an _RGBA_ color?
 *
 * @param value Value to check
 * @returns `true` if the value is an _RGBA_ color, otherwise `false`
 */
export function isRgbaColor(value: unknown): value is RGBAColor {
	return isColorValue(value, COLOR_KEYS.rgba);
}

export function isRgbaLike(value: unknown): value is Record<keyof RGBAColor, unknown> {
	return hasKeys(value, COLOR_KEYS.rgba);
}

/**
 * Is the value an _RGB_ color?
 *
 * @param value Value to check
 * @returns `true` if the value is an _RGB_ color, otherwise `false`
 */
export function isRgbColor(value: unknown): value is RGBColor {
	return isColorValue(value, COLOR_KEYS.rgba) || isColorValue(value, COLOR_KEYS.rgb);
}

export function isRgbLike(value: unknown): value is Record<keyof RGBColor, unknown> {
	return hasKeys(value, COLOR_KEYS.rgb);
}

function isPercentage(value: unknown): value is number {
	return typeof value === 'number' && between(value, 0, COLOR_MAX.percent);
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
