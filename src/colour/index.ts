import type {RGBColourValue} from '~/colour/rgb';

/**
 * Get a foreground colour _(usually text)_ based on a background colour's luminance
 */
export function getForegroundColour(value: RGBColourValue): string {
	const values = [value.blue / 255, value.green / 255, value.red / 255];

	for (let colour of values) {
		if (colour <= 0.03928) {
			colour /= 12.92;
		} else {
			colour = ((colour + 0.055) / 1.055) ** 2.4;
		}
	}

	const luminance =
		0.2126 * values[2] + 0.7152 * values[1] + 0.0722 * values[0];

	// Rudimentary and ureliable?; implement APCA for more reliable results?
	return luminance > 0.625 ? 'black' : 'white';
}

export {getHexColour, HexColour} from './hex';
export {getHSLColour, HSLColour, type HSLColourValue} from './hsl';
export {isColour, isHexColour, isHSLColour, isRGBColour} from './is';
export {getRGBColour, RGBColour, type RGBColourValue} from './rgb';

