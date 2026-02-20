import {getColor} from '../../src/color';

const alphas = [0, 1, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];

const foregrounds = [
	'000000',
	'ffffff',
	'ffffff',
	'ffffff',
	'000000',
	'ffffff',
	'ffffff',
	'ffffff',
	'ffffff',
	'ffffff',
];

const hexes = [
	'faf0e6',
	'3a75c4',
	'964b00',
	'006994',
	'9bddff',
	'ff9933',
	'122faa',
	'536872',
	'686c5e',
	'483c32',
];

const hsls = [
	{hue: 30, lightness: 94.12, saturation: 66.67},
	{hue: 214.35, lightness: 49.8, saturation: 54.33},
	{hue: 30, lightness: 29.41, saturation: 100},
	{hue: 197.43, lightness: 29.02, saturation: 100},
	{hue: 200.4, lightness: 80.39, saturation: 100},
	{hue: 30, lightness: 60, saturation: 100},
	{hue: 228.55, lightness: 36.86, saturation: 80.85},
	{hue: 199.35, lightness: 38.63, saturation: 15.74},
	{hue: 77.14, lightness: 39.61, saturation: 6.93},
	{hue: 27.27, lightness: 23.92, saturation: 18.03},
];

const hslas = hsls.map((hsl, index) => ({...hsl, alpha: alphas[index]}));

const instances = hexes.map(hex => getColor(hex));

const rgbs = [
	{blue: 230, green: 240, red: 250},
	{blue: 196, green: 117, red: 58},
	{blue: 0, green: 75, red: 150},
	{blue: 148, green: 105, red: 0},
	{blue: 255, green: 221, red: 155},
	{blue: 51, green: 153, red: 255},
	{blue: 170, green: 47, red: 18},
	{blue: 114, green: 104, red: 83},
	{blue: 94, green: 108, red: 104},
	{blue: 50, green: 60, red: 72},
];

const rgbas = rgbs.map((rgb, index) => ({...rgb, alpha: alphas[index]}));

const shorts = ['fff', '3ac', '960', '069', '9bf', 'f93', '12a', '568', '685', '432'];

export const colorFixture = {
	alphas,
	foregrounds,
	hexes,
	hsls,
	hslas,
	instances,
	rgbs,
	rgbas,
	shorts,
};
