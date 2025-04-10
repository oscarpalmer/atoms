import type {PlainObject} from './models';
import {clamp} from './number';

export type HSLColor = {
	hue: number;
	lightness: number;
	saturation: number;
};

export type RGBColor = {
	blue: number;
	green: number;
	red: number;
};

type State = {
	hex: string;
	hsl: HSLColor;
	rgb: RGBColor;
};

export class Color {
	private readonly $color = true;

	private readonly state: State;

	get hex(): string {
		return this.state.hex;
	}

	get hsl(): HSLColor {
		return this.state.hsl;
	}

	get rgb(): RGBColor {
		return this.state.rgb;
	}

	constructor(value: unknown) {
		this.state = getState(value);
	}
}

/**
 * Get a color from any kind of value
 */
export function getColor(value: unknown): Color {
	return isColor(value) ? value : new Color(value);
}

/**
 * Get a foreground color _(usually text)_ based on a background color's luminance
 */
export function getForegroundColor(value: unknown): Color {
	const original = getColor(value);
	const {blue, green, red} = original.rgb;

	const values = [blue / 255, green / 255, red / 255];

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
	return getColor(luminance > 0.625 ? '000000' : 'ffffff');
}

/**
 * Get the hex-color from any kind of value
 */
export function getHexColor(value: unknown): string {
	return getColor(value).hex;
}

/**
 * Get the HSL-color from any kind of value
 */
export function getHSLColor(value: unknown): HSLColor {
	return getColor(value).hsl;
}

/**
 * Get the RGB-color from any kind of value
 */
export function getRGBColor(value: unknown): RGBColor {
	return getColor(value).rgb;
}

/**
 * Try to get the normalized hex-color from a value _(defaults to `#000000`)_
 */
function getNormalisedHex(value: unknown): string {
	if (!isHexColor(value)) {
		return String(defaultHex);
	}

	const normalized = value.replace(/^#/, '');

	return normalized.length === 3
		? normalized
				.split('')
				.map(character => character.repeat(2))
				.join('')
		: normalized;
}

/**
 * Get color state from any kind of value
 */
function getState(value: unknown): State {
	if (typeof value === 'string') {
		const hex = getNormalisedHex(value);
		const rgb = hexToRgb(hex);

		return {
			hex,
			rgb,
			hsl: rgbToHsl(rgb),
		};
	}

	const state: Partial<State> = {};

	if (typeof value === 'object' && value !== null) {
		if (isHSLColor(value)) {
			state.hsl = {
				hue: clamp(value.hue, 0, 360),
				lightness: clamp(value.lightness, 0, 100),
				saturation: clamp(value.saturation, 0, 100),
			};

			state.rgb = hslToRgb(state.hsl as HSLColor);
			state.hex = rgbToHex(state.rgb as RGBColor);

			return state as State;
		}

		if (isRGBColor(value)) {
			state.rgb = {
				blue: clamp(value.blue, 0, 255),
				green: clamp(value.green, 0, 255),
				red: clamp(value.red, 0, 255),
			};

			state.hex = rgbToHex(state.rgb as RGBColor);
			state.hsl = rgbToHsl(state.rgb as RGBColor);

			return state as State;
		}
	}

	state.hex = String(defaultHex);
	state.hsl = {...defaultHsl};
	state.rgb = {...defaultRgb};

	return state as State;
}

/**
 * Convert a hex-color to an RGB-color
 */
function hexToRgb(value: string): RGBColor {
	const hex = anyPattern.test(value) ? getNormalisedHex(value) : '';
	const pairs = groupedPattern.exec(hex) ?? [];
	const rgb = [];

	const {length} = pairs;

	for (let index = 1; index < length; index += 1) {
		rgb.push(Number.parseInt(pairs[index], 16));
	}

	return {
		blue: rgb[2] ?? 0,
		green: rgb[1] ?? 0,
		red: rgb[0] ?? 0,
	};
}

/**
 * - Convert an HSL-color to an RGB-color
 * - Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L61
 */
function hslToRgb(value: HSLColor): RGBColor {
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

	return {
		blue: clamp(Math.round(get(4) * 255), 0, 255),
		green: clamp(Math.round(get(8) * 255), 0, 255),
		red: clamp(Math.round(get(0) * 255), 0, 255),
	};
}

/**
 * Is the value a color?
 */
export function isColor(value: unknown): value is Color {
	return (
		typeof value === 'object' &&
		value !== null &&
		'$color' in value &&
		value.$color === true
	);
}

/**
 * Is the value a hex-color?
 */
export function isHexColor(value: unknown): value is string {
	return typeof value === 'string' && anyPattern.test(value);
}

/**
 * Is the value an HSL-color?
 */
export function isHSLColor(value: unknown): value is HSLColor {
	return isObject(value, hslKeys);
}

/**
 * Is the value an RGB-color?
 */
export function isRGBColor(value: unknown): value is RGBColor {
	return isObject(value, rgbKeys);
}

function isObject(value: unknown, properties: Set<string>): boolean {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const keys = Object.keys(value);
	const {length} = keys;

	if (length !== properties.size) {
		return false;
	}

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const val = (value as PlainObject)[key];

		if (
			!properties.has(key) ||
			!(
				typeof val === 'number' ||
				(typeof val === 'string' && /^\d+$/.test(val))
			)
		) {
			return false;
		}
	}

	return true;
}

/**
 * Convert an RGB-color to a hex-color
 */
function rgbToHex(value: RGBColor): string {
	return `${[value.red, value.green, value.blue]
		.map(color => {
			const hex = color.toString(16);

			return hex.length === 1 ? `0${hex}` : hex;
		})
		.join('')}`;
}

/**
 * - Convert an RGB-color to an HSL-color
 * - Thanks, https://github.com/color-js/color.js/blob/main/src/spaces/hsl.js#L26
 */
function rgbToHsl(rgb: RGBColor): HSLColor {
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

	return {
		hue: +hue.toFixed(2),
		lightness: +(lightness * 100).toFixed(2),
		saturation: +(saturation * 100).toFixed(2),
	};
}

const anyPattern = /^#?([a-f0-9]{3}){1,2}$/i;

const defaultHex = '000000';

const defaultHsl: HSLColor = {
	hue: 0,
	lightness: 0,
	saturation: 0,
};

const defaultRgb: RGBColor = {
	blue: 0,
	green: 0,
	red: 0,
};

const groupedPattern = /^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;

const hslKeys = new Set(['hue', 'lightness', 'saturation']);
const rgbKeys = new Set(['blue', 'green', 'red']);
