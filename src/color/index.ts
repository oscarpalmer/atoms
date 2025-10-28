import {Color} from './instance';
import {isColor} from './misc/is';
import type {HSLAColor, HSLColor, RGBAColor, RGBColor} from './models';

export * from './misc/foreground';
export * from './misc/is';

export {
	getHexColor,
	getNormalizedHex,
	hexToHsl,
	hexToHsla,
	hexToRgb,
	hexToRgba,
} from './space/hex';

export {
	getHslaColor,
	getHslColor,
	hslToHex,
	hslToRgb,
	hslToRgba,
} from './space/hsl';

export {
	getRgbaColor,
	getRgbColor,
	rgbToHex,
	rgbToHsl,
	rgbToHsla,
} from './space/rgb';

export type {Color, HSLAColor, HSLColor, RGBAColor, RGBColor};

/**
 * Get a color from any kind of value
 * @param value Original value
 * @returns Color instance
 */
export function getColor(value: unknown): Color {
	return isColor(value) ? value : new Color(value);
}
