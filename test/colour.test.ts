import {expect, test} from 'bun:test';
import {
	getForegroundColour,
	hexToRgb,
	hslToRgb,
	rgbToHex,
	rgbToHsl,
} from '../src/js/colour';

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

test('getForegroundColour', () => {
	for (let index = 0; index < length; index += 1) {
		expect(getForegroundColour(rgbs[index])).toBe(foregrounds[index]);
	}
});

test('hexToRgb', () => {
	for (let index = 0; index < length; index += 1) {
		const {blue, green, red} = hexToRgb(hexes[index]);

		expect(blue).toBe(rgbs[index].blue);
		expect(green).toBe(rgbs[index].green);
		expect(red).toBe(rgbs[index].red);
	}
});

test('hslToRgb', () => {
	expect(
		hslToRgb({
			hue: -90,
			lightness: 50,
			saturation: 50,
		}).toString(),
	).toBe('rgb(128, 64, 191)');
});

test('rgbToHex', () => {
	for (let index = 0; index < length; index += 1) {
		expect(rgbToHex(rgbs[index]).value).toBe(hexes[index]);
	}
});

test('HexColour', () => {
	for (let index = 0; index < length; index += 1) {
		const rgb = hexToRgb(hexes[index]);
		const hex = rgb.toHex();

		const {value} = hex;

		expect(value).toBe(hexes[index]);
		expect(String(hex)).toBe(hexes[index]);

		expect(hex.toHsl().value).toEqual(hsls[index]);
		expect(hex.toRgb().value).toEqual(rgbs[index]);

		hex.value = 'invalid';

		expect(hex.value).toBe(value);

		hex.value = '#fab';

		expect(hex.value).toBe('#ffaabb');
	}
});

test('HSLColour', () => {
	for (let index = 0; index < length; index += 1) {
		const hsl = rgbToHsl(rgbs[index]);
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

		expect(hsl.hue).toBe(180);

		hsl.hue = 999;

		expect(hsl.hue).toBe(360);

		expect(rgb.value).toEqual(rgbs[index]);

		const {blue, green, red} = rgb;

		expect(blue).toBe(rgbs[index].blue);
		expect(green).toBe(rgbs[index].green);
		expect(red).toBe(rgbs[index].red);

		expect(hex.value).toBe(hexes[index]);
	}
});

test('RGBColour', () => {
	for (let index = 0; index < length; index += 1) {
		const rgb = hslToRgb(hsls[index]);

		expect(rgb.value).toEqual(rgbs[index]);

		const {blue, green, red} = rgb;

		expect(blue).toBe(rgbs[index].blue);
		expect(green).toBe(rgbs[index].green);
		expect(red).toBe(rgbs[index].red);

		expect(rgb.toString()).toBe(
			`rgb(${rgbs[index].red}, ${rgbs[index].green}, ${rgbs[index].blue})`,
		);

		const hsl = rgb.toHsl();

		expect(hsl.value).toEqual(hsls[index]);

		const {hue, lightness, saturation} = hsl;

		expect(hue).toBe(hsls[index].hue);
		expect(lightness).toBe(hsls[index].lightness);
		expect(saturation).toBe(hsls[index].saturation);

		expect(rgb.toHex().value).toBe(hexes[index]);
	}
});
