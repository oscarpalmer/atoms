import {createProperty} from '../internal/colour-property';
import {createHex} from './hex';
import {createHsl} from './hsl';
import type {HSLColour, HexColour, RGBColour, RGBColourValue} from './models';

export function createRgb(original: RGBColourValue): RGBColour {
	const value = {...original};

	const instance = Object.create({
		toHex() {
			return rgbToHex(value);
		},
		toHsl() {
			return rgbToHsl(value);
		},
		toString() {
			return `rgb(${value.red}, ${value.green}, ${value.blue})`;
		},
	});

	Object.defineProperties(instance, {
		blue: createProperty(value, 'blue', 0, 255),
		green: createProperty(value, 'green', 0, 255),
		red: createProperty(value, 'red', 0, 255),
		value: {value},
	});

	return instance;
}

/**
 * Convert an RGB-colour to a hex-colour
 */
export function rgbToHex(value: RGBColourValue): HexColour {
	return createHex(
		`${[value.red, value.green, value.blue]
			.map(colour => {
				const hex = colour.toString(16);

				return hex.length === 1 ? `0${hex}` : hex;
			})
			.join('')}`,
	);
}

/**
 * - Convert an RGB-colour to an HSL-colour
 * - Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L26
 */
export function rgbToHsl(rgb: RGBColourValue): HSLColour {
	const blue = rgb.blue / 255;
	const green = rgb.green / 255;
	const red = rgb.red / 255;

	const max = Math.max(blue, green, red);
	const min = Math.min(blue, green, red);

	const delta = max - min;
	const lightness = (min + max) / 2;

	let hue = 0;
	let saturation = 0;

	if (delta !== 0) {
		saturation =
			lightness === 0 || lightness === 1
				? 0
				: (max - lightness) / Math.min(lightness, 1 - lightness);

		switch (max) {
			case blue:
				hue = (red - green) / delta + 4;
				break;
			case green:
				hue = (blue - red) / delta + 2;
				break;
			case red:
				hue = (green - blue) / delta + (green < blue ? 6 : 0);
				break;
			default:
				break;
		}

		hue *= 60;
	}

	if (saturation < 0) {
		hue += 180;
		saturation = Math.abs(saturation);
	}

	if (hue >= 360) {
		hue -= 360;
	}

	return createHsl({
		hue: +hue.toFixed(2),
		lightness: +(lightness * 100).toFixed(2),
		saturation: +(saturation * 100).toFixed(2),
	});
}
