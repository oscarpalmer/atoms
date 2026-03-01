import {expect, test} from 'vitest';
import {
	hexToHsl,
	hexToHsla,
	hexToRgb,
	hexToRgba,
	hslToHex,
	hslToRgb,
	hslToRgba,
	rgbToHex,
	rgbToHsl,
	rgbToHsla,
} from '../../src';
import {DEFAULT_HSL, DEFAULT_RGB, HEX_BLACK} from '../../src/color/constants';
import {colorFixture} from '../.fixtures/color.fixture';

const {hexes, hsls, rgbs} = colorFixture;
const {length} = hexes;

test('hexToHsl(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const hsl = hsls[index];
		expect(hexToHsl(hex)).toEqual(hsl);
		expect(hexToHsla(hex)).toEqual({...hsl, alpha: 1});
	}

	expect(hexToHsl('invalid')).toEqual(DEFAULT_HSL);
	expect(hexToHsla('invalid')).toEqual({...DEFAULT_HSL, alpha: 1});
});

test('hexToRgb(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const rgb = rgbs[index];

		expect(hexToRgb(hex)).toEqual(rgb);
		expect(hexToRgba(hex)).toEqual({...rgb, alpha: 1});
	}

	expect(hexToRgb('invalid')).toEqual(DEFAULT_RGB);
	expect(hexToRgba('invalid')).toEqual({...DEFAULT_RGB, alpha: 1});
});

test('hslToHex(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const hsl = hsls[index];

		expect(hslToHex(hsl)).toEqual(hex);
		expect(hslToHex(hsl, true)).toEqual(`${hex}ff`);
	}
});

test('hslToRgb(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hsl = hsls[index];
		const rgb = rgbs[index];

		expect(hslToRgb(hsl)).toEqual(rgb);
		expect(hslToRgba(hsl)).toEqual({...rgb, alpha: 1});
	}

	expect(hslToRgb(123 as never)).toEqual(DEFAULT_RGB);
});

test('rgbToHex(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const rgb = rgbs[index];

		expect(rgbToHex(rgb)).toEqual(hex);
		expect(rgbToHex(rgb, true)).toEqual(`${hex}ff`);
	}

	expect(rgbToHex(123 as never)).toEqual(HEX_BLACK);
});

test('rgbToHsl(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hsl = hsls[index];
		const rgb = rgbs[index];

		expect(rgbToHsl(rgb)).toEqual(hsl);
		expect(rgbToHsla(rgb)).toEqual({...hsl, alpha: 1});
	}

	expect(
		rgbToHsl({
			red: 192,
			green: 128,
			blue: 64,
		}),
	).toEqual({
		hue: 30,
		lightness: 50.2,
		saturation: 50.39,
	});

	expect(
		rgbToHsl({
			red: 192,
			green: 64,
			blue: 128,
		}),
	).toEqual({
		hue: 330,
		lightness: 50.2,
		saturation: 50.39,
	});

	expect(rgbToHsl(123 as never)).toEqual(DEFAULT_HSL);
});
