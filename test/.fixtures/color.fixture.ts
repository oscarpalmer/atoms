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
		lightness: 94.11764705882352,
		saturation: 66.6666666666666,
	},
	{
		hue: 214.34782608695653,
		lightness: 49.80392156862745,
		saturation: 54.330708661417326,
	},
	{
		hue: 30,
		lightness: 29.411764705882355,
		saturation: 100,
	},
	{
		hue: 197.43243243243245,
		lightness: 29.01960784313726,
		saturation: 100,
	},
	{
		hue: 200.39999999999998,
		lightness: 80.3921568627451,
		saturation: 100,
	},
	{
		hue: 29.999999999999996,
		lightness: 60,
		saturation: 100,
	},
	{
		hue: 228.55263157894737,
		lightness: 36.86274509803921,
		saturation: 80.85106382978724,
	},
	{
		hue: 199.35483870967744,
		lightness: 38.62745098039216,
		saturation: 15.736040609137056,
	},
	{
		hue: 77.14285714285715,
		lightness: 39.6078431372549,
		saturation: 6.930693069306919,
	},
	{
		hue: 27.272727272727273,
		lightness: 23.921568627450977,
		saturation: 18.03278688524591,
	},
];

const hslas = hsls.map((hsl, index) => ({...hsl, alpha: alphas[index]}));

const hwbs = [
	{
		hue: 30,
		whiteness: 90.19607843137256,
		blackness: 1.9607843137254943,
	},
	{
		hue: 214.34782608695653,
		whiteness: 22.745098039215687,
		blackness: 23.13725490196078,
	},
	{
		hue: 30,
		whiteness: 0,
		blackness: 41.17647058823529,
	},
	{
		hue: 197.43243243243245,
		whiteness: 0,
		blackness: 41.96078431372548,
	},
	{
		hue: 200.39999999999998,
		whiteness: 60.78431372549019,
		blackness: 0,
	},
	{
		hue: 29.999999999999996,
		whiteness: 20,
		blackness: 0,
	},
	{
		hue: 228.55263157894737,
		whiteness: 7.0588235294117645,
		blackness: 33.333333333333336,
	},
	{
		hue: 199.35483870967744,
		whiteness: 32.549019607843135,
		blackness: 55.294117647058826,
	},
	{
		hue: 77.14285714285715,
		whiteness: 36.86274509803922,
		blackness: 57.647058823529406,
	},
	{
		hue: 27.272727272727273,
		whiteness: 19.607843137254903,
		blackness: 71.76470588235294,
	},
];

const hwbas = hwbs.map((hwb, index) => ({...hwb, alpha: alphas[index]}));

const instances = hexes.map(hex => getColor(hex));

const is: [string, boolean | undefined, boolean][] = [
	['aaa', undefined, true],
	['aaaa', undefined, true],
	['aaaa', false, false],
	['aaaaaa', undefined, true],
	['aaaaaaa', undefined, false],
	['aaaaaaaa', undefined, true],
	['aaaaaaaa', false, false],
	['ööö', undefined, false],
	['öööö', undefined, false],
	['öööööö', undefined, false],
	['öööööööö', undefined, false],
];

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
	is,
	rgbs,
	rgbas,
	shorts,
};
