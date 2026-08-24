import {expect, test} from 'vitest';
import {
	hexToHsl,
	hexToHsla,
	hexToRgb,
	hexToRgba,
	hslToHex,
	hslToHwb,
	hslToHwba,
	hslToRgb,
	hslToRgba,
	hwbToHex,
	hwbToHsl,
	hwbToHsla,
	hwbToRgb,
	hwbToRgba,
	rgbToHex,
	rgbToHsl,
	rgbToHsla,
	rgbToHwb,
	rgbToHwba,
	round,
} from '../../src';
import {COLOR_DEFAULTS} from '../../src/color/constants';
import {hexToHwb, hexToHwba} from '../../src/color/space/hex';
import {colorFixture} from '../.fixtures/color.fixture';

const {hexes, hsls, hwbs, rgbs} = colorFixture;
const {length} = hexes;

function roundColor(value: number): number {
	// Often a precision loss when converting colors,
	// so we round the values to 4 decimal places for comparison,
	// which should be acceptable decimal precision for color values

	return round(value, 4);
}

function roundColors<Values extends Record<string, number>>(values: Values): Values {
	const keys = Object.keys(values) as (keyof Values)[];
	const {length} = keys;

	const copy: Partial<Values> = {};

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];

		copy[key] = roundColor(values[key]) as never;
	}

	return copy as Values;
}

test('hexToHsl(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const hsl = hsls[index];

		expect(roundColors(hexToHsl(hex))).toEqual(roundColors(hsl));
		expect(roundColors(hexToHsla(hex))).toEqual({...roundColors(hsl), alpha: 100});
	}

	expect(hexToHsl('invalid')).toEqual(COLOR_DEFAULTS.hsl);
	expect(hexToHsla('invalid')).toEqual({...COLOR_DEFAULTS.hsl, alpha: 100});
});

test('hexToHwb(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const hwb = hwbs[index];

		expect(roundColors(hexToHwb(hex))).toEqual(roundColors(hwb));
		expect(roundColors(hexToHwba(hex))).toEqual({...roundColors(hwb), alpha: 100});
	}

	expect(hexToHwb('invalid')).toEqual(COLOR_DEFAULTS.hwb);
	expect(hexToHwba('invalid')).toEqual({...COLOR_DEFAULTS.hwb, alpha: 100});
});

test('hexToRgb(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const rgb = rgbs[index];

		expect(hexToRgb(hex)).toEqual(rgb);
		expect(hexToRgba(hex)).toEqual({...rgb, alpha: 100});
	}

	expect(hexToRgb('invalid')).toEqual(COLOR_DEFAULTS.rgb);
	expect(hexToRgba('invalid')).toEqual({...COLOR_DEFAULTS.rgb, alpha: 100});
});

test('hslToHex(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const hsl = hsls[index];

		expect(hslToHex(hsl)).toEqual(hex);
		expect(hslToHex(hsl, true)).toEqual(`${hex}ff`);
	}

	expect(hslToHex(123 as never)).toEqual(COLOR_DEFAULTS.hexBlack);
	expect(hslToHex(123 as never, true)).toEqual(`${COLOR_DEFAULTS.hexBlack}ff`);
});

test('hslToHwb(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hsl = hsls[index];
		const hwb = hwbs[index];

		expect(roundColors(hslToHwb(hsl))).toEqual(roundColors(hwb));
		expect(roundColors(hslToHwba(hsl))).toEqual({...roundColors(hwb), alpha: 100});
	}

	expect(hslToHwb(123 as never)).toEqual(COLOR_DEFAULTS.hwb);
	expect(hslToHwba(123 as never)).toEqual({...COLOR_DEFAULTS.hwb, alpha: 100});
});

test('hslToRgb(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hsl = hsls[index];
		const rgb = rgbs[index];

		expect(roundColors(hslToRgb(hsl))).toEqual(roundColors(rgb));
		expect(roundColors(hslToRgba(hsl))).toEqual({...roundColors(rgb), alpha: 100});
	}

	expect(hslToRgb(123 as never)).toEqual(COLOR_DEFAULTS.rgb);
	expect(hslToRgba(123 as never)).toEqual({...COLOR_DEFAULTS.rgb, alpha: 100});
});

test('hwbToHex(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const hwb = hwbs[index];

		expect(hwbToHex(hwb)).toEqual(hex);
		expect(hwbToHex(hwb, true)).toEqual(`${hex}ff`);
	}

	expect(hwbToHex(123 as never)).toEqual(COLOR_DEFAULTS.hexBlack);
	expect(hwbToHex(123 as never, true)).toEqual(`${COLOR_DEFAULTS.hexBlack}ff`);
});

test('hwbToHsl(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hwb = hwbs[index];
		const hsl = hsls[index];

		expect(roundColors(hwbToHsl(hwb))).toEqual(roundColors(hsl));
		expect(roundColors(hwbToHsla(hwb))).toEqual({...roundColors(hsl), alpha: 100});
	}

	expect(hwbToHsl(123 as never)).toEqual(COLOR_DEFAULTS.hsl);
	expect(hwbToHsla(123 as never)).toEqual({...COLOR_DEFAULTS.hsl, alpha: 100});
});

test('hwbToRgb(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hwb = hwbs[index];
		const rgb = rgbs[index];

		expect(roundColors(hwbToRgb(hwb))).toEqual(roundColors(rgb));
		expect(roundColors(hwbToRgba(hwb))).toEqual({...roundColors(rgb), alpha: 100});
	}

	expect(hwbToRgb(123 as never)).toEqual(COLOR_DEFAULTS.rgb);
	expect(hwbToRgba(123 as never)).toEqual({...COLOR_DEFAULTS.rgb, alpha: 100});
});

test('rgbToHex(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hex = hexes[index];
		const rgb = rgbs[index];

		expect(rgbToHex(rgb)).toEqual(hex);
		expect(rgbToHex(rgb, true)).toEqual(`${hex}ff`);
	}

	expect(rgbToHex(123 as never)).toEqual(COLOR_DEFAULTS.hexBlack);
	expect(rgbToHex(123 as never, true)).toEqual(`${COLOR_DEFAULTS.hexBlack}ff`);
});

test('rgbToHsl(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hsl = hsls[index];
		const rgb = rgbs[index];

		expect(roundColors(rgbToHsl(rgb))).toEqual(roundColors(hsl));
		expect(roundColors(rgbToHsla(rgb))).toEqual({...roundColors(hsl), alpha: 100});
	}

	expect(
		roundColors(
			rgbToHsl({
				red: 192,
				green: 128,
				blue: 64,
			}),
		),
	).toEqual({
		hue: 30,
		lightness: 50.1961,
		saturation: 50.3937,
	});

	expect(
		roundColors(
			rgbToHsl({
				red: 192,
				green: 64,
				blue: 128,
			}),
		),
	).toEqual({
		hue: 330,
		lightness: 50.1961,
		saturation: 50.3937,
	});

	expect(rgbToHsl(123 as never)).toEqual(COLOR_DEFAULTS.hsl);
	expect(rgbToHsla(123 as never)).toEqual({...COLOR_DEFAULTS.hsl, alpha: 100});
});

test('rgbToHwb(a)', () => {
	for (let index = 0; index < length; index += 1) {
		const hwb = hwbs[index];
		const rgb = rgbs[index];

		expect(roundColors(rgbToHwb(rgb))).toEqual(roundColors(hwb));
		expect(roundColors(rgbToHwba(rgb))).toEqual({...roundColors(hwb), alpha: 100});
	}

	expect(
		roundColors(
			rgbToHwb({
				red: 192,
				green: 128,
				blue: 64,
			}),
		),
	).toEqual({
		hue: 30,
		whiteness: 25.098,
		blackness: 24.7059,
	});

	expect(
		roundColors(
			rgbToHwb({
				red: 192,
				green: 64,
				blue: 128,
			}),
		),
	).toEqual({
		hue: 330,
		whiteness: 25.098,
		blackness: 24.7059,
	});

	expect(rgbToHwb(123 as never)).toEqual(COLOR_DEFAULTS.hwb);
	expect(rgbToHwba(123 as never)).toEqual({...COLOR_DEFAULTS.hwb, alpha: 100});
});
