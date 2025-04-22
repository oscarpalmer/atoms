import {expect, test} from 'vitest';
import {
	getColor,
	getForegroundColor,
	getHSLColor,
	getHexColor,
	getRGBColor,
	isColor,
	isHSLColor,
	isHexColor,
	isRGBColor,
} from '../src/color';
import {defaultRgb} from '../src/color/constants';
import {hexToRgb, hslToRgb, rgbToHex, rgbToHsl} from '../src/color/value';
import {getRandomItem} from '../src/random';

const foregrounds = [
	'000000',
	'ffffff',
	'ffffff',
	'ffffff',
	'000000',
	'000000',
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

const {length} = hexes;

test('color', () => {
	const color = getColor('hello, world!');

	expect(color.hex).toEqual('000000');

	color.hex = 'ffffff';

	expect(color.hex).toEqual('ffffff');

	color.hex = 'ffffff';

	expect(color.hex).toEqual('ffffff');

	color.hex = 'hello, world!';

	expect(color.hex).toEqual('ffffff');

	color.hsl = {hue: 0, lightness: 0, saturation: 0};

	expect(color.hsl).toEqual({hue: 0, lightness: 0, saturation: 0});

	color.hsl = {hue: 0, lightness: 0, saturation: 0};

	expect(color.hsl).toEqual({hue: 0, lightness: 0, saturation: 0});

	color.hsl = {hue: 900, lightness: 0, saturation: 0};

	expect(color.hsl).toEqual({hue: 0, lightness: 0, saturation: 0});

	color.rgb = {red: 0, green: 0, blue: 0};

	expect(color.rgb).toEqual({red: 0, green: 0, blue: 0});

	color.rgb = {red: 0, green: 0, blue: 0};

	expect(color.rgb).toEqual({red: 0, green: 0, blue: 0});

	color.rgb = {red: 552, green: 0, blue: 0};

	expect(color.rgb).toEqual({red: 0, green: 0, blue: 0});
});

test('getColor + isColor', () => {
	const indices = Array.from({length}).map((_, index) => index);

	for (let index = 0; index < length; index += 1) {
		const color = getColor(hexes[index]);

		expect(color.hex).toEqual(hexes[index]);
		expect(color.hsl).toEqual(hsls[index]);
		expect(color.rgb).toEqual(rgbs[index]);

		let next = getRandomItem(indices.filter(value => value !== index));

		if (next != null) {
			color.hex = hexes[next];

			expect(color.hex).toEqual(hexes[next]);
			expect(color.hsl).toEqual(hsls[next]);
			expect(color.rgb).toEqual(rgbs[next]);
		}

		next = getRandomItem(indices.filter(value => value !== index));

		if (next != null) {
			color.hsl = hsls[next];

			expect(color.hex).toEqual(hexes[next]);
			expect(color.hsl).toEqual(hsls[next]);
			expect(color.rgb).toEqual(rgbs[next]);
		}

		next = getRandomItem(indices.filter(value => value !== index));

		if (next != null) {
			color.rgb = rgbs[next];

			expect(color.hex).toEqual(hexes[next]);
			expect(color.hsl).toEqual(hsls[next]);
			expect(color.rgb).toEqual(rgbs[next]);
		}
	}

	const values = [
		...hexes,
		...hsls,
		...rgbs,
		true,
		123,
		BigInt(123),
		{},
		[],
		() => {},
	];

	const size = values.length;

	for (let index = 0; index < size; index += 1) {
		const value = values[index];
		const color = getColor(value);

		expect(isColor(color)).toBe(true);
		expect(isColor(value)).toBe(false);
	}

	const first = getColor(null);
	const second = getColor(first);

	expect(first).toBe(second);
});

test('getForegroundColor', () => {
	for (let index = 0; index < length; index += 1) {
		expect(getForegroundColor(rgbs[index]).hex).toBe(foregrounds[index]);
	}
});

test('getHexColor', () => {
	for (let index = 0; index < length; index += 1) {
		expect(getHexColor(hexes[index])).toEqual(hexes[index]);
	}

	const short = hexes.map(
		hex => `${hex.slice(0, 1)}${hex.slice(2, 3)}${hex.slice(4, 5)}`,
	);

	const long = short.map(
		hex =>
			`${hex.slice(0, 1).repeat(2)}${hex.slice(1, 2).repeat(2)}${hex.slice(2, 3).repeat(2)}`,
	);

	for (let index = 0; index < length; index += 1) {
		expect(getHexColor(short[index])).toEqual(long[index]);
	}

	expect(getHexColor('invalid')).toBe('000000');
});

test('getHslColor', () => {
	const {length} = hsls;

	for (let index = 0; index < length; index += 1) {
		const {hue, lightness, saturation} = hsls[index];

		const hsl = getHSLColor(hsls[index]);

		expect(hsl.hue).toBe(hue);
		expect(hsl.lightness).toBe(lightness);
		expect(hsl.saturation).toBe(saturation);
	}
});

test('getRgbColor', () => {
	const {length} = hsls;

	for (let index = 0; index < length; index += 1) {
		const {blue, green, red} = rgbs[index];

		const rgb = getRGBColor(rgbs[index]);

		expect(rgb.blue).toBe(blue);
		expect(rgb.green).toBe(green);
		expect(rgb.red).toBe(red);
	}
});

test('is', () => {
	const hex = getHexColor(hexes[0]);
	const hsl = getHSLColor(hex);
	const rgb = getRGBColor(hex);

	expect(isHexColor('aaa')).toBe(true);
	expect(isHexColor('aaaa')).toBe(false);
	expect(isHexColor('aaaaaa')).toBe(true);
	expect(isHexColor('aaaaaaa')).toBe(false);
	expect(isHexColor('ööö')).toBe(false);
	expect(isHexColor('öööö')).toBe(false);
	expect(isHexColor('ööööööö')).toBe(false);

	expect(isHexColor(hex)).toBe(true);
	expect(isHexColor(hsl)).toBe(false);
	expect(isHexColor(rgb)).toBe(false);

	expect(isHSLColor(hex)).toBe(false);
	expect(isHSLColor(hsl)).toBe(true);
	expect(isHSLColor({hello: 'world'})).toBe(false);
	expect(isHSLColor({hue: 'x', lightness: 0, saturation: 0})).toBe(false);
	expect(isHSLColor({hue: 900, lightness: 0, saturation: 0})).toBe(false);
	expect(isHSLColor(rgb)).toBe(false);

	expect(isRGBColor(hex)).toBe(false);
	expect(isRGBColor(hsl)).toBe(false);
	expect(isRGBColor(rgb)).toBe(true);
	expect(isRGBColor({hello: 'world'})).toBe(false);
	expect(isRGBColor({red: 'x', green: 0, blue: 0})).toBe(false);
	expect(isRGBColor({red: 900, green: 0, blue: 0})).toBe(false);

	expect(isColor(hex)).toBe(false);
	expect(isColor(hsl)).toBe(false);
	expect(isColor(rgb)).toBe(false);
});

test('value', () => {
	expect(
		hslToRgb({
			hue: -900,
			lightness: 0,
			saturation: 0,
		}),
	).toEqual(defaultRgb);
});
