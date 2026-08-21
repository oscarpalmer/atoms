import {color} from './instance';
import {isColor} from './misc/is';
import type {Color, HSLAColor, HSLColor, HWBAColor, HWBColor, RGBAColor, RGBColor} from './models';

// #region Functions

/**
 * Get a _Color_ from any kind of value
 *
 * - Values that can be parsed are: hex(a) color strings, as well as _HSL(A)_, _HWB(A)_, and _RGB(A)_ color objects
 * - If the value is unable to be parsed, a black _Color_ will be returned
 *
 * @param value Original value
 * @returns _Color_ instance
 */
export function getColor(value: unknown): Color {
	return isColor(value) ? value : color(value);
}

// #endregion

// #region Exports

export {
	getForegroundColor,
	getHexaColor,
	getHexColor,
	getHslaColor,
	getHslColor,
	getHwbaColor,
	getHwbColor,
	getRgbaColor,
	getRgbColor,
} from './misc/get';

export {
	isColor,
	isHexColor,
	isHslaColor,
	isHslColor,
	isHslLike,
	isHwbaColor,
	isHwbaLike,
	isHwbColor,
	isHwbLike,
	isRgbaColor,
	isRgbColor,
	isRgbLike,
} from './misc/is';

export {
	getNormalizedHex,
	hexToHsl,
	hexToHsla,
	hexToHwb,
	hexToHwba,
	hexToRgb,
	hexToRgba,
} from './space/hex';
export {hslToHex, hslToHwb, hslToHwba, hslToRgb, hslToRgba} from './space/hsl';
export {hwbToHex, hwbToHsl, hwbToHsla, hwbToRgb, hwbToRgba} from './space/hwb';
export {rgbToHex, rgbToHsl, rgbToHsla, rgbToHwb, rgbToHwba} from './space/rgb';
export type {Color, HSLAColor, HSLColor, HWBAColor, HWBColor, RGBAColor, RGBColor};

// #endregion
