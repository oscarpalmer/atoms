import {getColor} from '../../src';

const alphas = [0, 100, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];

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
	{
		hue: 30,
		lightness: 94.1176,
		saturation: 66.6667,
	},
	{
		hue: 214.3478,
		lightness: 49.8039,
		saturation: 54.3307,
	},
	{
		hue: 30,
		lightness: 29.4118,
		saturation: 100,
	},
	{
		hue: 197.4324,
		lightness: 29.0196,
		saturation: 100,
	},
	{
		hue: 200.4,
		lightness: 80.3922,
		saturation: 100,
	},
	{
		hue: 30,
		lightness: 60,
		saturation: 100,
	},
	{
		hue: 228.5526,
		lightness: 36.8627,
		saturation: 80.8511,
	},
	{
		hue: 199.3548,
		lightness: 38.6275,
		saturation: 15.736,
	},
	{
		hue: 77.1429,
		lightness: 39.6078,
		saturation: 6.9307,
	},
	{
		hue: 27.2727,
		lightness: 23.9216,
		saturation: 18.0328,
	},
];

const hslas = hsls.map((hsl, index) => ({...hsl, alpha: alphas[index]}));

const hwbs = [
	{
		blackness: 1.9608,
		hue: 30,
		whiteness: 90.1961,
	},
	{
		blackness: 23.1373,
		hue: 214.3478,
		whiteness: 22.7451,
	},
	{
		blackness: 41.1765,
		hue: 30,
		whiteness: 0,
	},
	{
		blackness: 41.9608,
		hue: 197.4324,
		whiteness: 0,
	},
	{
		blackness: 0,
		hue: 200.4,
		whiteness: 60.7843,
	},
	{
		blackness: 0,
		hue: 30,
		whiteness: 20,
	},
	{
		blackness: 33.3333,
		hue: 228.5526,
		whiteness: 7.0588,
	},
	{
		blackness: 55.2941,
		hue: 199.3548,
		whiteness: 32.549,
	},
	{
		blackness: 57.6471,
		hue: 77.1429,
		whiteness: 36.8627,
	},
	{
		blackness: 71.7647,
		hue: 27.2727,
		whiteness: 19.6078,
	},
];

const hwbas = hwbs.map((hwb, index) => ({...hwb, alpha: alphas[index]}));

const instances = hexes.map(hex => getColor(hex));

const rgbs = [
	{
		blue: 230,
		green: 240,
		red: 250,
	},
	{
		blue: 196,
		green: 117,
		red: 58,
	},
	{
		blue: 0,
		green: 75,
		red: 150,
	},
	{
		blue: 148,
		green: 105,
		red: 0,
	},
	{
		blue: 255,
		green: 221,
		red: 155,
	},
	{
		blue: 51,
		green: 153,
		red: 255,
	},
	{
		blue: 170,
		green: 47,
		red: 18,
	},
	{
		blue: 114,
		green: 104,
		red: 83,
	},
	{
		blue: 94,
		green: 108,
		red: 104,
	},
	{
		blue: 50,
		green: 60,
		red: 72,
	},
];

const rgbas = rgbs.map((rgb, index) => ({...rgb, alpha: alphas[index]}));

const shorts = ['fff', '3ac', '960', '069', '9bf', 'f93', '12a', '568', '685', '432'];

export const colorFixture = {
	alphas,
	foregrounds,
	hexes,
	hsls,
	hslas,
	hwbs,
	hwbas,
	instances,
	rgbs,
	rgbas,
	shorts,
};
