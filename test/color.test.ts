import {expect, test} from 'vitest';
import {
	HSLColor,
	HexColor,
	RGBColor,
	getForegroundColor,
	getHSLColor,
	getHexColor,
	getRGBColor,
	isColor,
	isHSLColor,
	isHexColor,
	isRGBColor,
} from '../src/color';
import {hslToRgb} from '../src/color/functions';

const foregrounds = [
	'black',
	'white',
	'white',
	'white',
	'black',
	'black',
	'white',
	'white',
	'white',
	'white',
];

const hexes = [
	'#faf0e6',
	'#3a75c4',
	'#964b00',
	'#006994',
	'#9bddff',
	'#ff9933',
	'#122faa',
	'#536872',
	'#686c5e',
	'#483c32',
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

test('getForegroundColor', () => {
	for (let index = 0; index < length; index += 1) {
		expect(getForegroundColor(rgbs[index])).toBe(foregrounds[index]);
	}
});

test('getHexColor', () => {
	for (let index = 0; index < length; index += 1) {
		expect(getHexColor(hexes[index]).value).toEqual(hexes[index]);
	}

	expect(getHexColor('invalid').value).toBe('#000000');
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

test('hexToRgb', () => {
	for (let index = 0; index < length; index += 1) {
		const {blue, green, red} = HexColor.toRgb(hexes[index]);

		expect(blue).toBe(rgbs[index].blue);
		expect(green).toBe(rgbs[index].green);
		expect(red).toBe(rgbs[index].red);
	}
});

test('hslToRgb', () => {
	for (let index = 0; index < length; index += 1) {
		expect(hslToRgb(hsls[index]).value).toEqual(rgbs[index]);
	}
});

test('is', () => {
	const hex = getHexColor(hexes[0]);
	const hsl = hex.toHsl();
	const rgb = hsl.toRgb();

	expect(isHexColor(hex)).toBe(true);
	expect(isHexColor(hsl)).toBe(false);
	expect(isHexColor(rgb)).toBe(false);

	expect(isHSLColor(hex)).toBe(false);
	expect(isHSLColor(hsl)).toBe(true);
	expect(isHSLColor(rgb)).toBe(false);

	expect(isRGBColor(hex)).toBe(false);
	expect(isRGBColor(hsl)).toBe(false);
	expect(isRGBColor(rgb)).toBe(true);

	expect(isColor(hex)).toBe(true);
	expect(isColor(hsl)).toBe(true);
	expect(isColor(rgb)).toBe(true);
});

test('rgbToHex', () => {
	for (let index = 0; index < length; index += 1) {
		expect(RGBColor.toHex(rgbs[index]).value).toBe(hexes[index]);
	}
});

test('rgbToHsl', () => {
	for (let index = 0; index < length; index += 1) {
		expect(RGBColor.toHsl(rgbs[index]).value).toEqual(hsls[index]);
	}
});

test('HexColor', () => {
	for (let index = 0; index < length; index += 1) {
		const rgb = HexColor.toRgb(hexes[index]);
		const hex = rgb.toHex();

		const {value} = hex;

		expect(value).toBe(hexes[index]);
		expect(String(hex)).toBe(hexes[index]);

		expect(hex.toHsl().value).toEqual(hsls[index]);
		expect(hex.toRgb().value).toEqual(rgbs[index]);

		hex.value = 'invalid';

		expect(hex.value).toBe('#000000');

		hex.value = 'fab';

		expect(hex.value).toBe('#ffaabb');
	}
});

test('HSLColor', () => {
	for (let index = 0; index < length; index += 1) {
		const hsl = RGBColor.toHsl(rgbs[index]);
		const rgb = hsl.toRgb();
		const hex = hsl.toHex();

		expect(hsl.value).toEqual(hsls[index]);

		const {hue, lightness, saturation} = hsl;

		expect(hue).toBe(hsls[index].hue);
		expect(lightness).toBe(hsls[index].lightness);
		expect(saturation).toBe(hsls[index].saturation);

		expect(hsl.toString()).toBe(
			`hsl(${hsls[index].hue}, ${hsls[index].saturation}%, ${hsls[index].lightness}%)`,
		);

		hsl.hue = 180;
		hsl.lightness = 50;
		hsl.saturation = 50;

		expect(hsl.hue).toBe(180);
		expect(hsl.lightness).toBe(50);
		expect(hsl.saturation).toBe(50);

		hsl.hue = 999;
		hsl.lightness = 999;
		hsl.saturation = 999;

		expect(hsl.hue).toBe(360);
		expect(hsl.lightness).toBe(100);
		expect(hsl.saturation).toBe(100);

		expect(rgb.value).toEqual(rgbs[index]);

		const {blue, green, red} = rgb;

		expect(blue).toBe(rgbs[index].blue);
		expect(green).toBe(rgbs[index].green);
		expect(red).toBe(rgbs[index].red);

		expect(hex.value).toBe(hexes[index]);

		hsl.value = {hue: 0, lightness: 100, saturation: 0};

		expect(hsl.hue).toBe(0);
		expect(hsl.lightness).toBe(100);
		expect(hsl.saturation).toBe(0);

		expect(hsl.toRgb().value).toEqual({blue: 255, green: 255, red: 255});
		expect(hsl.toHex().value).toBe('#ffffff');
	}
});

test('RGBColor', () => {
	for (let index = 0; index < length; index += 1) {
		const rgb = HSLColor.toRgb(hsls[index]);

		expect(rgb.value).toEqual(rgbs[index]);

		const {blue, green, red} = rgb;

		expect(blue).toBe(rgbs[index].blue);
		expect(green).toBe(rgbs[index].green);
		expect(red).toBe(rgbs[index].red);

		expect(rgb.toString()).toBe(
			`rgb(${rgbs[index].red}, ${rgbs[index].green}, ${rgbs[index].blue})`,
		);

		let hsl = rgb.toHsl();

		rgb.blue = 128;
		rgb.green = 128;
		rgb.red = 128;

		expect(rgb.blue).toBe(128);
		expect(rgb.green).toBe(128);
		expect(rgb.red).toBe(128);

		rgb.blue = blue;
		rgb.green = green;
		rgb.red = red;

		expect(rgb.blue).toBe(blue);
		expect(rgb.green).toBe(green);
		expect(rgb.red).toBe(red);

		expect(hsl.value).toEqual(hsls[index]);

		const {hue, lightness, saturation} = hsl;

		expect(hue).toBe(hsls[index].hue);
		expect(lightness).toBe(hsls[index].lightness);
		expect(saturation).toBe(hsls[index].saturation);

		expect(rgb.toHex().value).toBe(hexes[index]);

		rgb.value = {blue: 255, green: 255, red: 255};

		expect(rgb.blue).toBe(255);
		expect(rgb.green).toBe(255);
		expect(rgb.red).toBe(255);

		expect(rgb.toHex().value).toBe('#ffffff');

		hsl = rgb.toHsl();

		expect(hsl.hue).toBe(0);
		expect(hsl.lightness).toBe(100);
		expect(hsl.saturation).toBe(0);
	}
});
