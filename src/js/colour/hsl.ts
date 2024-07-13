import {createProperty} from '../internal/colour-property';
import {clamp} from '../number';
import type {HSLColour, HSLColourValue, RGBColour} from './models';
import {createRgb} from './rgb';

export function createHsl(original: HSLColourValue): HSLColour {
	const value = {...original};

	const instance = Object.create({
		toHex() {
			return hslToRgb(value).toHex();
		},
		toRgb() {
			return hslToRgb(value);
		},
		toString() {
			return `hsl(${value.hue}, ${value.saturation}%, ${value.lightness}%)`;
		},
	});

	Object.defineProperties(instance, {
		hue: createProperty(value, 'hue', 0, 360),
		lightness: createProperty(value, 'lightness', 0, 100),
		saturation: createProperty(value, 'saturation', 0, 100),
		value: {value},
	});

	return instance;
}

/**
 * - Convert an HSL-colour to an RGB-colour
 * - Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L61
 */
export function hslToRgb(value: HSLColourValue): RGBColour {
	let hue = value.hue % 360;

	if (hue < 0) {
		hue += 360;
	}

	const saturation = value.saturation / 100;
	const lightness = value.lightness / 100;

	function get(value: number) {
		const part = (value + hue / 30) % 12;
		const mod = saturation * Math.min(lightness, 1 - lightness);

		return lightness - mod * Math.max(-1, Math.min(part - 3, 9 - part, 1));
	}

	return createRgb({
		blue: clamp(Math.round(get(4) * 255), 0, 255),
		green: clamp(Math.round(get(8) * 255), 0, 255),
		red: clamp(Math.round(get(0) * 255), 0, 255),
	});
}
