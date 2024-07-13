import type {HexColour, RGBColour} from './models';
import {createRgb} from './rgb';

const anyPattern = /^#*([a-f0-9]{3}){1,2}$/i;
const groupedPattern = /^#*([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;

export function createHex(original: string): HexColour {
	let value = original.slice();

	const instance = Object.create({
		toHsl() {
			return hexToRgb(value).toHsl();
		},
		toRgb() {
			return hexToRgb(value);
		},
		toString() {
			return `#${value}`;
		},
	});

	Object.defineProperty(instance, 'value', {
		get() {
			return `#${value}`;
		},
		set(hex: string) {
			if (anyPattern.test(hex)) {
				value = getNormalisedHex(hex);
			}
		},
	});

	return instance;
}

/**
 * Get a hex-colour from a string
 */
export function getHexColour(value: string): HexColour {
	return createHex(anyPattern.test(value) ? getNormalisedHex(value) : '000000');
}

function getNormalisedHex(value: string): string {
	const normalised = value.replace(/^#/, '');

	return normalised.length === 3
		? normalised
				.split('')
				.map(character => character.repeat(2))
				.join('')
		: normalised;
}

/**
 * Convert a hex-colour to an RGB-colour
 */
export function hexToRgb(value: string): RGBColour {
	const hex = anyPattern.test(value) ? getNormalisedHex(value) : '';
	const pairs = groupedPattern.exec(hex) ?? [];
	const rgb = [];

	const {length} = pairs;

	for (let index = 1; index < length; index += 1) {
		rgb.push(Number.parseInt(pairs[index], 16));
	}

	return createRgb({blue: rgb[2] ?? 0, green: rgb[1] ?? 0, red: rgb[0] ?? 0});
}
