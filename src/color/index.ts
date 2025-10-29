import {Color} from './instance';
import {isColor} from './misc/is';
import type {HSLAColor, HSLColor, RGBAColor, RGBColor} from './models';

export {
	getForegroundColor,
	getHexaColor,
	getHexColor,
	getHslaColor,
	getHslColor,
	getRgbaColor,
	getRgbColor,
} from './misc/get';

export * from './misc/is';

export {
	getNormalizedHex,
	hexToHsl,
	hexToHsla,
	hexToRgb,
	hexToRgba,
} from './space/hex';

export {
	hslToHex,
	hslToRgb,
	hslToRgba,
} from './space/hsl';

export {
	rgbToHex,
	rgbToHsl,
	rgbToHsla,
} from './space/rgb';

export type {Color, HSLAColor, HSLColor, RGBAColor, RGBColor};

/**
 * Get a Color from any kind of value
 * @param value Original value
 * @returns Color instance
 */
export function getColor(value: unknown): Color {
	return isColor(value) ? value : new Color(value);
}
