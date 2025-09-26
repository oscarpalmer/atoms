import type {ColorProperty, HSLColor, RGBColor} from './models';

export const DEFAULT_HEX = '000000';

export const DEFAULT_HSL: HSLColor = {
	hue: 0,
	lightness: 0,
	saturation: 0,
};

export const DEFAULT_RGB: RGBColor = {
	blue: 0,
	green: 0,
	red: 0,
};

export const EXPRESSION_ANY = /^#?([a-f0-9]{3}){1,2}$/i;

export const EXPRESSION_GROUPED = /^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;

export const EXPRESSION_PREFIX = /^#/;

export const KEYS_HSL: Set<ColorProperty> = new Set([
	'hue',
	'lightness',
	'saturation',
]);

export const KEYS_RGB: Set<ColorProperty> = new Set(['blue', 'green', 'red']);

export const MAX_DEGREE = 360;

export const MAX_HEX = 255;

export const MAX_PERCENT = 100;
