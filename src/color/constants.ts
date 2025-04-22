import type {ColorProperty, HSLColor, RGBColor} from './models';

export const anyPattern = /^#?([a-f0-9]{3}){1,2}$/i;

export const defaultHex = '000000';

export const defaultHsl: HSLColor = {
	hue: 0,
	lightness: 0,
	saturation: 0,
};

export const defaultRgb: RGBColor = {
	blue: 0,
	green: 0,
	red: 0,
};

export const groupedPattern = /^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i;

export const hslKeys = new Set<ColorProperty>([
	'hue',
	'lightness',
	'saturation',
]);

export const prefixPattern = /^#/;

export const rgbKeys = new Set<ColorProperty>(['blue', 'green', 'red']);
