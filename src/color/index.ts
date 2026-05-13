import {Color} from './instance';
import {isColor} from './misc/is';
import type {HSLAColor, HSLColor, RGBAColor, RGBColor} from './models';

// #region Functions

/**
 * Get a _Color_ from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, _HSL(A)_ color objects, and _RGB(A)_ color objects
 * - If the value is unable to be parsed, a black _Color_ will be returned
 *
 * @param value Original value
 * @returns _Color_ instance
 */
export function getColor(value: unknown): Color {
	return isColor(value) ? value : new Color(value);
}

// #endregion

// #region Exports

export {
	getForegroundColor,
	getHexaColor,
	getHexColor,
	getHslaColor,
	getHslColor,
	getRgbaColor,
	getRgbColor,
} from './misc/get';

export {
	isColor,
	isHexColor,
	isHslColor,
	isHslLike,
	isHslaColor,
	isRgbColor,
	isRgbLike,
	isRgbaColor,
} from './misc/is';

export {getNormalizedHex, hexToHsl, hexToHsla, hexToRgb, hexToRgba} from './space/hex';
export {hslToHex, hslToRgb, hslToRgba} from './space/hsl';
export {rgbToHex, rgbToHsl, rgbToHsla} from './space/rgb';
export type {Color, HSLAColor, HSLColor, RGBAColor, RGBColor};

// #endregion
