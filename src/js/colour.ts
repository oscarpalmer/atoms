import {clamp} from './number';

type Colour<Model> = {
	/**
	 * The current value of the colour
	 */
	readonly value: Model;
	/**
	 * Convert the colour to a hex-colour
	 */
	toHex(): HexColour;
	/**
	 * Get the colour as a _CSS-formatted_ string
	 */
	toString(): string;
};

export type HexColour = {
	/**
	 * The current value of the colour
	 */
	value: string;
	/**
	 * Convert the colour to an RGB-colour
	 */
	toHsl(): HSLColour;
	/**
	 * Convert the colour to an HSL-colour
	 */
	toRgb(): RGBColour;
	/**
	 * Get the colour as a string
	 */
	toString(): string;
};

export type HSLColour = {
	/**
	 * The current hue
	 */
	hue: number;
	/**
	 * The current lightness
	 */
	lightness: number;
	/**
	 * The current saturation
	 */
	saturation: number;
	/**
	 * Convert the colour to an RGB-colour
	 */
	toRgb(): RGBColour;
} & Colour<HSLColourValue>;

export type HSLColourValue = {
	hue: number;
	lightness: number;
	saturation: number;
};

type Property<Value> = {
	get(): Value;
	set(value: Value): void;
};

export type RGBColour = {
	/**
	 * The current blue value
	 */
	blue: number;
	/**
	 * The current green value
	 */
	green: number;
	/**
	 * The current red value
	 */
	red: number;
	/**
	 * Convert the colour to an HSL-colour
	 */
	toHsl(): HSLColour;
} & Colour<RGBColourValue>;

export type RGBColourValue = {
	blue: number;
	green: number;
	red: number;
};

const anyPattern = /^#*([a-f0-9]{3}){1,2}$/i;
const groupedPattern = /^#*([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;

function createHex(original: string): HexColour {
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

function createHsl(original: HSLColourValue): HSLColour {
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

function createProperty(
	store: Record<string, number>,
	key: string,
	min: number,
	max: number,
): Property<number> {
	return {
		get() {
			return store[key];
		},
		set(value) {
			store[key] = clamp(value, min, max);
		},
	};
}

function createRgb(original: RGBColourValue): RGBColour {
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

