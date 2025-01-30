import type {RGBColorValue} from './rgb';

/**
 * Get a foreground color _(usually text)_ based on a background color's luminance
 */
export function getForegroundColor(value: RGBColorValue): string {
	const values = [value.blue / 255, value.green / 255, value.red / 255];

	for (let color of values) {
		if (color <= 0.03928) {
			color /= 12.92;
		} else {
			color = ((color + 0.055) / 1.055) ** 2.4;
		}
	}

	const luminance =
		0.2126 * values[2] + 0.7152 * values[1] + 0.0722 * values[0];

	// Rudimentary and ureliable?; implement APCA for more reliable results?
	return luminance > 0.625 ? 'black' : 'white';
}

export {hexToRgb, hslToRgb, rgbToHex, rgbToHsl} from './functions';
export {getHexColor, HexColor} from './hex';
export {getHSLColor, HSLColor, type HSLColorValue} from './hsl';
export {isColor, isHexColor, isHSLColor, isRGBColor} from './is';
export {getRGBColor, RGBColor, type RGBColorValue} from './rgb';

